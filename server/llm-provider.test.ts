// server/llm-provider.test.ts
// Tests for the ARIA LLM provider — specifically the tool_use_id tracking fix
// that prevents "messages.X.content.Y.tool_use.id: Field required" errors from Anthropic

import { describe, expect, it, vi, beforeEach } from "vitest";

// We test the conversion logic by importing the module and exercising it
// through a mock of the Anthropic SDK

// Mock the Anthropic SDK
vi.mock("@anthropic-ai/sdk", () => {
  const mockCreate = vi.fn();
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: { create: mockCreate },
      models: { list: vi.fn().mockResolvedValue({ data: [] }) },
    })),
    __mockCreate: mockCreate,
  };
});

// Mock the OpenAI fallback
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { role: "assistant", content: "fallback response", tool_calls: undefined }, finish_reason: "stop" }],
  }),
}));

describe("ARIA LLM Provider — tool_use_id tracking", () => {
  it("preserves tool_use.id in multi-turn conversations via _anthropicContent", async () => {
    // This test verifies the core fix: when Claude returns tool_use blocks,
    // the response includes _anthropicContent with the exact Anthropic content blocks.
    // The agent stores these on the assistant message, and on the next call,
    // convertMessagesToAnthropic() uses them directly to preserve tool_use.id values.

    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const instance = new Anthropic({ apiKey: "test" });
    const mockCreate = instance.messages.create as ReturnType<typeof vi.fn>;

    // Simulate Claude returning a tool_use block
    const toolUseId = "toolu_01AbCdEfGhIjKlMnOpQrStUv";
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "tool_use",
          id: toolUseId,
          name: "get_campaign_data",
          input: { campaign_id: "ABC123" },
        },
      ],
      stop_reason: "tool_use",
    });

    const { invokeARIALLM } = await import("./aria/llm-provider");

    const response = await invokeARIALLM({
      messages: [
        { role: "system", content: "You are ARIA." },
        { role: "user", content: "Show campaign ABC123 performance" },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "get_campaign_data",
            description: "Get campaign data",
            parameters: {
              type: "object",
              properties: { campaign_id: { type: "string" } },
              required: ["campaign_id"],
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    // The response should include the tool call
    expect(response.choices[0].message.tool_calls).toBeDefined();
    expect(response.choices[0].message.tool_calls![0].id).toBe(toolUseId);

    // The response should include _anthropicContent with the raw blocks
    expect("_anthropicContent" in response).toBe(true);
    const anthropicContent = (response as { _anthropicContent: unknown[] })._anthropicContent;
    expect(Array.isArray(anthropicContent)).toBe(true);
    expect(anthropicContent[0]).toMatchObject({
      type: "tool_use",
      id: toolUseId,
      name: "get_campaign_data",
    });
  });

  it("correctly extracts tool_call_id from tool result messages", async () => {
    // Test that extractToolCallId correctly reads _tool_call_id from JSON content
    // This is the format agent.ts uses when storing tool results

    const toolCallId = "toolu_01AbCdEfGhIjKlMnOpQrStUv";
    const toolResultContent = JSON.stringify({
      _tool_call_id: toolCallId,
      status: "success",
      data: { impressions: 10000 },
      message: null,
      kind: "campaign_data",
    });

    // We verify this by calling invokeARIALLM with a tool result message
    // and checking that the Anthropic API receives the correct tool_use_id
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const instance = new Anthropic({ apiKey: "test" });
    const mockCreate = instance.messages.create as ReturnType<typeof vi.fn>;

    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "Campaign had 10,000 impressions." }],
      stop_reason: "end_turn",
    });

    const { invokeARIALLM } = await import("./aria/llm-provider");

    await invokeARIALLM({
      messages: [
        { role: "system", content: "You are ARIA." },
        { role: "user", content: "Show campaign data" },
        {
          role: "assistant",
          content: "",
          tool_calls: [
            {
              id: toolCallId,
              type: "function",
              function: { name: "get_campaign_data", arguments: '{"campaign_id":"ABC123"}' },
            },
          ],
          // Simulate having _anthropicContent stored from previous response
          _anthropicContent: [
            {
              type: "tool_use",
              id: toolCallId,
              name: "get_campaign_data",
              input: { campaign_id: "ABC123" },
            },
          ] as unknown[],
        },
        {
          role: "tool",
          content: toolResultContent,
        },
      ],
    });

    // Verify the Anthropic API was called with the correct tool_use_id
    const callArgs = mockCreate.mock.calls[mockCreate.mock.calls.length - 1][0];
    const messages = callArgs.messages as Array<{ role: string; content: unknown }>;

    // Find the user message with tool_result
    const toolResultMessage = messages.find(
      (m) =>
        m.role === "user" &&
        Array.isArray(m.content) &&
        (m.content as Array<{ type: string }>)[0]?.type === "tool_result"
    );

    expect(toolResultMessage).toBeDefined();
    const toolResultBlock = (toolResultMessage!.content as Array<{ type: string; tool_use_id: string }>)[0];
    expect(toolResultBlock.tool_use_id).toBe(toolCallId);
  });

  it("falls back to OpenAI when ANTHROPIC_API_KEY is not set", async () => {
    const originalKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    const { invokeLLM } = await import("./_core/llm");
    const mockFallback = invokeLLM as ReturnType<typeof vi.fn>;

    const { invokeARIALLM } = await import("./aria/llm-provider");

    await invokeARIALLM({
      messages: [{ role: "user", content: "Hello" }],
    });

    // Should have called the OpenAI fallback
    expect(mockFallback).toHaveBeenCalled();

    process.env.ANTHROPIC_API_KEY = originalKey;
  });
});
