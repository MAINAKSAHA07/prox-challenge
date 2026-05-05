import { describe, expect, it } from "vitest";
import { recommendWeldingProcess } from "./processSelector";

describe("recommendWeldingProcess", () => {
  it("1/8 mild steel outdoor no gas → flux or stick", () => {
    const r = recommendWeldingProcess({
      material: "mild steel",
      thicknessInches: 0.125,
      indoorOutdoor: "outdoor",
      gasAvailable: false,
    });
    expect(["Flux-Cored", "Stick"]).toContain(r.primary);
    expect(r.avoid.some((a) => /gas/i.test(a) || /MIG/i.test(a))).toBe(true);
  });
});
