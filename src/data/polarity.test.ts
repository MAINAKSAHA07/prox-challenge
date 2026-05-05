import { describe, expect, it } from "vitest";
import { getPolaritySetup } from "./polarity";

describe("polarity", () => {
  it("MIG solid: ground negative, wire feed positive", () => {
    const p = getPolaritySetup("mig_solid");
    const g = p.connections.find((c) => c.role === "ground_clamp");
    const w = p.connections.find((c) => c.role === "wire_feed_power");
    expect(g?.socket).toBe("negative");
    expect(w?.socket).toBe("positive");
  });

  it("Flux-cored: ground positive, wire feed negative", () => {
    const p = getPolaritySetup("flux_cored");
    const g = p.connections.find((c) => c.role === "ground_clamp");
    const w = p.connections.find((c) => c.role === "wire_feed_power");
    expect(g?.socket).toBe("positive");
    expect(w?.socket).toBe("negative");
  });

  it("TIG: ground positive, torch negative, wire feed disconnected", () => {
    const p = getPolaritySetup("tig");
    expect(p.connections.find((c) => c.role === "ground_clamp")?.socket).toBe(
      "positive",
    );
    expect(p.connections.find((c) => c.role === "tig_torch")?.socket).toBe(
      "negative",
    );
    expect(
      p.connections.find((c) => c.role === "wire_feed_power")?.socket,
    ).toBe("n/a");
  });
});
