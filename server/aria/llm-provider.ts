// server/aria/llm-provider.ts
// Anthropic Claude as primary LLM, OpenAI as fallback
// Normalises both APIs into a single interface compatible with ARIA's tool-calling agent loop

import Anthropic from "@anthropic-ai/sdk";
import { invokeLLM as openAIFallback } from "../_core/llm";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Claude model to use — claude-3-5-sonnet is the best balance of speed + intelligence
const CLAUDE_MODEL = "claude-3-5-sonnet-20241022";
const CLAUDE_MAX_TOKENS = 8192;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LLMMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | unknown;
  tool_calls?: AnthropicToolCall[];
}

export interface AnthropicToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface LLMTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface LLMResponse {
  choices: Array<{
    message: {
      role: string;
      content: string | null;
      tool_calls?: AnthropicToolCall[];
    };
    finish_reason: string;
  }>;
}

// ─── Anthropic → OpenAI normaliser ───────────────────────────────────────────

function convertToolsToAnthropic(tools: LLMTool[]): Anthropic.Tool[] {
  return tools.map((t) => ({
    name: t.function.name,
    description: t.function.description,
    input_schema: t.function.parameters as Anthropic.Tool["input_schema"],
  }));
}

function convertMessagesToAnthropic(
  messages: LLMMessage[]
): { system: string; messages: Anthropic.MessageParam[] } {
  let system = "";
  const converted: Anthropic.MessageParam[] = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      system += (typeof msg.content === "string" ? msg.content : "") + "\n";
      continue;
    }

    if (msg.role === "tool") {
      // Tool result — attach to previous assistant message as tool_result block
      const prev = converted[converted.length - 1];
      if (prev && prev.role === "user" && Array.isArray(prev.content)) {
        // Already a user message with tool results
        (prev.content as Anthropic.ToolResultBlockParam[]).push({
          type: "tool_result",
          tool_use_id: extractToolCallId(msg.content),
          content: extractToolContent(msg.content),
        });
      } else {
        converted.push({
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: extractToolCallId(msg.content),
              content: extractToolContent(msg.content),
            } as Anthropic.ToolResultBlockParam,
          ],
        });
      }
      continue;
    }

    if (msg.role === "assistant" && msg.tool_calls && msg.tool_calls.length > 0) {
      // Assistant message with tool calls
      const blocks: Anthropic.ContentBlock[] = [];

      if (msg.content) {
        blocks.push({ type: "text", text: typeof msg.content === "string" ? msg.content : "", citations: [] } as unknown as Anthropic.ContentBlock);
      }

      for (const tc of msg.tool_calls) {
        blocks.push({
          type: "tool_use",
          id: tc.id,
          name: tc.function.name,
          input: JSON.parse(tc.function.arguments || "{}"),
        } as Anthropic.ToolUseBlock);
      }

      converted.push({ role: "assistant", content: blocks });
      continue;
    }

    // Regular user/assistant message
    converted.push({
      role: msg.role as "user" | "assistant",
      content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
    });
  }

  return { system: system.trim(), messages: converted };
}

function extractToolCallId(content: unknown): string {
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      return parsed.tool_call_id ?? "unknown";
    } catch {
      return "unknown";
    }
  }
  return "unknown";
}

function extractToolContent(content: unknown): string {
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      // Remove tool_call_id from the content we send back
      const { tool_call_id, ...rest } = parsed;
      void tool_call_id;
      return JSON.stringify(rest);
    } catch {
      return content;
    }
  }
  return JSON.stringify(content);
}

function convertAnthropicResponseToOpenAI(response: Anthropic.Message): LLMResponse {
  const toolCalls: AnthropicToolCall[] = [];
  let textContent = "";

  for (const block of response.content) {
    if (block.type === "text") {
      textContent += block.text;
    } else if (block.type === "tool_use") {
      toolCalls.push({
        id: block.id,
        type: "function",
        function: {
          name: block.name,
          arguments: JSON.stringify(block.input),
        },
      });
    }
  }

  return {
    choices: [
      {
        message: {
          role: "assistant",
          content: textContent || null,
          tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
        },
        finish_reason: response.stop_reason ?? "stop",
      },
    ],
  };
}

// ─── Primary invoke function ──────────────────────────────────────────────────

export async function invokeARIALLM(params: {
  messages: LLMMessage[];
  tools?: LLMTool[];
  tool_choice?: "auto" | "none" | "required";
  response_format?: unknown;
}): Promise<LLMResponse> {
  // Try Anthropic Claude first
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { system, messages } = convertMessagesToAnthropic(params.messages);

      const anthropicParams: Anthropic.MessageCreateParamsNonStreaming = {
        model: CLAUDE_MODEL,
        max_tokens: CLAUDE_MAX_TOKENS,
        messages,
      };

      if (system) {
        anthropicParams.system = system;
      }

      if (params.tools && params.tools.length > 0) {
        anthropicParams.tools = convertToolsToAnthropic(params.tools);

        // Map tool_choice
        if (params.tool_choice === "none") {
          anthropicParams.tool_choice = { type: "auto" };
        } else if (params.tool_choice === "required") {
          anthropicParams.tool_choice = { type: "any" };
        } else {
          anthropicParams.tool_choice = { type: "auto" };
        }
      }

      const response = await anthropic.messages.create(anthropicParams);
      console.log("[ARIA LLM] Claude response — stop_reason:", response.stop_reason, "blocks:", response.content.length);
      return convertAnthropicResponseToOpenAI(response);
    } catch (err) {
      console.warn("[ARIA LLM] Claude failed, falling back to OpenAI:", err);
    }
  }

  // Fallback to OpenAI via built-in invokeLLM
  console.log("[ARIA LLM] Using OpenAI fallback");
  const openAIMessages = params.messages.map((m) => ({
    role: m.role as "system" | "user" | "assistant" | "tool",
    content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
  }));

  const result = await openAIFallback({
    messages: openAIMessages,
    tools: params.tools as Parameters<typeof openAIFallback>[0]["tools"],
    tool_choice: params.tool_choice,
    response_format: params.response_format as Parameters<typeof openAIFallback>[0]["response_format"],
  });

  return result as LLMResponse;
}

// ─── Structured JSON helper (uses Claude when available) ──────────────────────

export async function invokeStructuredLLM<T>(params: {
  systemPrompt: string;
  userPrompt: string;
  schema: Record<string, unknown>;
  schemaName: string;
}): Promise<T> {
  // Try Anthropic Claude with JSON mode
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        system: params.systemPrompt + "\n\nYou must respond with valid JSON only, no markdown, no explanation.",
        messages: [{ role: "user", content: params.userPrompt + "\n\nRespond with valid JSON matching this schema: " + JSON.stringify(params.schema) }],
      });

      const text = response.content.find((b) => b.type === "text")?.text ?? "{}";
      // Extract JSON from response (Claude sometimes wraps in ```json)
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ?? text.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : text;
      return JSON.parse(jsonStr) as T;
    } catch (err) {
      console.warn("[ARIA LLM] Claude structured call failed, falling back to OpenAI:", err);
    }
  }

  // OpenAI fallback with JSON schema
  const result = await openAIFallback({
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: params.userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: params.schemaName,
        strict: true,
        schema: params.schema,
      },
    },
  });

  return JSON.parse(result.choices[0].message.content as string) as T;
}
