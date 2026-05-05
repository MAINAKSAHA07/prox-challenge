import { describe, expect, it } from "vitest";
import { hasWakePhrase, stripWakePhrase } from "./wakeWord";

describe("hasWakePhrase", () => {
  it("matches Hey Pilot and spacing variants", () => {
    expect(hasWakePhrase("hey pilot")).toBe(true);
    expect(hasWakePhrase("Hey, pilot!")).toBe(true);
    expect(hasWakePhrase("hay pilot help")).toBe(true);
    expect(hasWakePhrase("heypilot")).toBe(true);
  });

  it("matches question in same utterance", () => {
    expect(hasWakePhrase("hey pilot what is duty cycle")).toBe(true);
  });

  it("avoids false positives", () => {
    expect(hasWakePhrase("they pilot a drone")).toBe(false);
    expect(hasWakePhrase("I'm a pilot")).toBe(false);
    expect(hasWakePhrase("hi")).toBe(false);
    expect(hasWakePhrase("pilot only")).toBe(false);
  });
});

describe("stripWakePhrase", () => {
  it("removes wake and leaves question", () => {
    expect(stripWakePhrase("Hey Pilot duty cycle")).toBe("duty cycle");
    expect(stripWakePhrase("heypilot polarity")).toBe("polarity");
  });
});
