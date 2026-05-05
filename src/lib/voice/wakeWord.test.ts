import { describe, expect, it } from "vitest";
import { hasWakePhrase, stripWakePhrase } from "./wakeWord";

describe("hasWakePhrase", () => {
  it("matches Hey Weld and spacing variants", () => {
    expect(hasWakePhrase("hey weld")).toBe(true);
    expect(hasWakePhrase("Hey, weld!")).toBe(true);
    expect(hasWakePhrase("hay weld help")).toBe(true);
    expect(hasWakePhrase("heyweld")).toBe(true);
  });

  it("matches question in same utterance", () => {
    expect(hasWakePhrase("hey weld what is duty cycle")).toBe(true);
  });

  it("avoids false positives", () => {
    expect(hasWakePhrase("they weld steel")).toBe(false);
    expect(hasWakePhrase("hi")).toBe(false);
    expect(hasWakePhrase("weld only")).toBe(false);
  });
});

describe("stripWakePhrase", () => {
  it("removes wake and leaves question", () => {
    expect(stripWakePhrase("Hey Weld duty cycle")).toBe("duty cycle");
    expect(stripWakePhrase("heyweld polarity")).toBe("polarity");
  });
});
