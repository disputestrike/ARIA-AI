// server/aria/llm-provider.ts
// Anthropic Claude as primary LLM, OpenAI as fallback
// Normalises both APIs into a single interface compatible with ARIA's tool-calling agent loop
//
// KEY DESIGN: We store the ENTIRE Anthropic-native message history internally.
// The agent loop uses LLMMessage[] only for user/assistant text turns.
// Tool-use turns are stored as AnthropicNativeMessage[] in a parallel array.

import Anthropic from "@anthropic-ai/sdk";
import { invokeLLM as openAIFallback } from "../_core/llm";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Claude model to use — claude-3-5-sonnet is the best balance of speed + intelligence
const CLAUDE_MODEL = "claude-sonnet-4-5-20250929";
const CLAUDE_MAX_TOKENS = 8192;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LLMMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | unknown;
  tool_calls?: AnthropicToolCall[];
  // Internal: raw Anthropic content blocks for assistant messages with tool_use
  _anthropicContent?: Anthropic.ContentBlock[];
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

// ─── Tool conversion ──────────────────────────────────────────────────────────

function convertToolsToAnthropic(tools: LLMTool[]): Anthropic.Tool[] {
  return tools.map((t) => ({
    name: t.function.name,
    description: t.function.description,
    input_schema: t.function.parameters as Anthropic.Tool["input_schema"],
  }));
}

// ─── Message conversion ───────────────────────────────────────────────────────
//
// The Anthropic API requires:
//   assistant turn: { role: "assistant", content: [{ type: "tool_use", id: "toolu_xxx", ... }] }
//   user turn:      { role: "user",      content: [{ type: "tool_result", tool_use_id: "toolu_xxx", ... }] }
//
// We store the raw Anthropic content blocks on assistant messages (_anthropicContent)
// so that when we reconstruct the history, the tool_use.id values are ALWAYS preserved
// and will exactly match the tool_use_id in the subsequent tool_result blocks.

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
      // Tool result — must follow an assistant message that had tool_use blocks.
      // We need to match the tool_use_id from the stored _anthropicContent.
      const toolUseId = extractToolCallId(msg.content);
      const toolContent = extractToolContent(msg.content);

      const toolResultBlock: Anthropic.ToolResultBlockParam = {
        type: "tool_result",
        tool_use_id: toolUseId,
        content: toolContent,
      };

      // Append to the last user message if it's already a tool_result group,
      // otherwise create a new user message
      const prev = converted[converted.length - 1];
      if (prev && prev.role === "user" && Array.isArray(prev.content)) {
        (prev.content as Anthropic.ToolResultBlockParam[]).push(toolResultBlock);
      } else {
        converted.push({
          role: "user",
          content: [toolResultBlock],
        });
      }
      continue;
    }

    if (msg.role === "assistant") {
      // If we have the raw Anthropic content blocks stored, use them directly.
      // This guarantees tool_use.id values are preserved exactly.
      if (msg._anthropicContent && msg._anthropicContent.length > 0) {
        converted.push({
          role: "assistant",
          content: msg._anthropicContent,
        });
        continue;
      }

      // If there are tool_calls (OpenAI format), convert them
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        const blocks: Anthropic.ContentBlock[] = [];

        if (msg.content && typeof msg.content === "string" && msg.content.trim()) {
          blocks.push({ type: "text", text: msg.content } as Anthropic.TextBlock);
        }

        for (const tc of msg.tool_calls) {
          const toolUseId = tc.id && tc.id.trim() ? tc.id : `toolu_${tc.function.name}_${Date.now()}`;
          let toolInput: Record<string, unknown> = {};
          try { toolInput = JSON.parse(tc.function.arguments || "{}"); } catch { toolInput = {}; }

          blocks.push({
            type: "tool_use",
            id: toolUseId,
            name: tc.function.name,
            input: toolInput,
          } as Anthropic.ToolUseBlock);
        }

        converted.push({ role: "assistant", content: blocks });
        continue;
      }

      // Regular assistant text message
      converted.push({
        role: "assistant",
        content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
      });
      continue;
    }

    // Regular user message
    converted.push({
      role: "user",
      content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
    });
  }

  return { system: system.trim(), messages: converted };
}

function extractToolCallId(content: unknown): string {
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      const id = parsed._tool_call_id ?? parsed.tool_call_id;
      return typeof id === "string" && id.trim() ? id : "unknown";
    } catch {
      return "unknown";
    }
  }
  return "unknown";
}

function extractToolContent(content: unknown): string {
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      const { _tool_call_id, tool_call_id, ...rest } = parsed;
      void _tool_call_id;
      void tool_call_id;
      return JSON.stringify(rest);
    } catch {
      return content;
    }
  }
  return JSON.stringify(content);
}

function convertAnthropicResponseToOpenAI(response: Anthropic.Message): LLMResponse & {
  _anthropicContent: Anthropic.ContentBlock[];
} {
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
    _anthropicContent: response.content,
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
}): Promise<LLMResponse & { _anthropicContent?: Anthropic.ContentBlock[] }> {
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
      console.warn("[ARIA LLM] Claude failed, falling back to OpenAI:", (err as Error).message);
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
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        system: params.systemPrompt + "\n\nYou must respond with valid JSON only, no markdown, no explanation.",
        messages: [{ role: "user", content: params.userPrompt + "\n\nRespond with valid JSON matching this schema: " + JSON.stringify(params.schema) }],
      });

      const text = response.content.find((b) => b.type === "text")?.text ?? "{}";
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ?? text.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : text;
      return JSON.parse(jsonStr) as T;
    } catch (err) {
      console.warn("[ARIA LLM] Claude structured call failed, falling back to OpenAI:", (err as Error).message);
    }
  }

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
