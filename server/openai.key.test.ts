import { describe, it, expect } from "vitest";
import { invokeLLM } from "./_core/llm";

describe("OpenAI API key validation", () => {
  it("should successfully call OpenAI with the new key", async () => {
    const response = await invokeLLM({
      messages: [
        { role: "user", content: "Reply with the single word: OK" },
      ],
    });
    const content = response.choices[0]?.message?.content ?? "";
    expect(typeof content).toBe("string");
    expect(content.length).toBeGreaterThan(0);
  }, 30000);
});
