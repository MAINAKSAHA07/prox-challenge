import { describe, expect, it } from "vitest";
import { lookupDutyCycle } from "./dutyCycles";

describe("lookupDutyCycle", () => {
  it("MIG 200A 240V is 25% with 2.5 / 7.5 minutes", () => {
    const r = lookupDutyCycle("MIG", "240", 200);
    expect(r.exact).toBe(true);
    expect(r.dutyCyclePercent).toBe(25);
    expect(r.weldMinutesPer10).toBe(2.5);
    expect(r.restMinutesPer10).toBe(7.5);
  });

  it("does not invent duty for unknown exact amperage", () => {
    const r = lookupDutyCycle("MIG", "240", 150);
    expect(r.exact).toBe(false);
    expect(r.dutyCyclePercent).toBeNull();
  });
});
