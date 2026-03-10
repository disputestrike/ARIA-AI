// server/aria/agent.ts
// ARIA Agent Loop — Anthropic Claude primary, OpenAI fallback
// Implements: load memory → build messages → invoke LLM with tools → dispatch tools → save memory → return

import { invokeARIALLM, type LLMMessage } from "./llm-provider";
import { ARIA_SYSTEM_PROMPT } from "./system-prompt";
import { loadMemory, saveMemory, buildMemoryContext } from "./memory";
import type { ToolResult } from "./memory";
import { ARIA_TOOLS } from "./tools/definitions";
import { dispatchTool } from "./tools/dispatcher";

export interface ARIAMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ARIAResponse {
  reply: string;
  toolResults: ToolResult[];
  updatedMessages: ARIAMessage[];
}

const MAX_TOOL_ROUNDS = 8; // Safety limit on agentic loops

export async function runARIAAgent(
  userId: number,
  userMessage: string,
  conversationHistory?: ARIAMessage[]
): Promise<ARIAResponse> {
  // 1. Load persistent memory
  const memory = await loadMemory(userId);
  const memoryContext = buildMemoryContext(memory);

  // 2. Build message history
  const history: ARIAMessage[] = conversationHistory ?? memory.messages ?? [];

  const messages: LLMMessage[] = [
    {
      role: "system",
      content: ARIA_SYSTEM_PROMPT + memoryContext,
    },
    ...history.slice(-20).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    {
      role: "user",
      content: userMessage,
    },
  ];

  const allToolResults: ToolResult[] = [];
  let finalReply = "";
  let rounds = 0;

  // 3. Agentic loop
  while (rounds < MAX_TOOL_ROUNDS) {
    rounds++;

    const response = await invokeARIALLM({
      messages,
      tools: ARIA_TOOLS as Parameters<typeof invokeARIALLM>[0]["tools"],
      tool_choice: "auto",
    });

    const choice = response.choices[0];
    const assistantMessage = choice.message;

    // Add assistant message to history
    const assistantLLMMessage: LLMMessage = {
      role: "assistant",
      content: assistantMessage.content ?? "",
      ...(assistantMessage.tool_calls ? { tool_calls: assistantMessage.tool_calls } : {}),
    };
    messages.push(assistantLLMMessage);

    // Check if we're done (no more tool calls)
    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      finalReply = assistantMessage.content ?? "";
      break;
    }

    // 4. Execute all tool calls in this round
    const toolCallResults: Array<{ tool_call_id: string; result: ToolResult }> = [];

    for (const toolCall of assistantMessage.tool_calls) {
      const toolName = toolCall.function.name;
      let args: Record<string, unknown> = {};

      try {
        args = JSON.parse(toolCall.function.arguments ?? "{}");
      } catch {
        args = {};
      }

      const result = await dispatchTool(toolName, args, userId);
      allToolResults.push(result);
      toolCallResults.push({ tool_call_id: toolCall.id, result });
    }

    // 5. Add tool results back to messages (in format both Claude and OpenAI understand)
    for (const { tool_call_id, result } of toolCallResults) {
      messages.push({
        role: "tool",
        content: JSON.stringify({ tool_call_id, ...result }),
      });
    }
  }

  // 6. Build updated conversation history (user-visible messages only)
  const updatedMessages: ARIAMessage[] = [
    ...history,
    { role: "user", content: userMessage },
    { role: "assistant", content: finalReply },
  ];

  // 7. Save memory
  await saveMemory(userId, memory, allToolResults, updatedMessages.slice(-40));

  return {
    reply: finalReply,
    toolResults: allToolResults,
    updatedMessages,
  };
}
