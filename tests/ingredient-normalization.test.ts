import { describe, it, expect } from "vitest";
import { normalizeIngredients } from "../src/lib/ingredient-normalization";

describe("ingredient normalization", () => {
  it("handles unicode fractions and converts to fractions", () => {
    const [n] = normalizeIngredients(["1½ cups flour"], {
      unitSystem: "imperial",
      amountFormat: "fraction",
      roundToFraction: 0.125,
    });
    expect(n.display).toMatch(/cup/);
  });

  it("handles hyphen mixed numbers", () => {
    const [n] = normalizeIngredients(["1-1/2 tbsp sugar"], {
      unitSystem: "imperial",
      amountFormat: "fraction",
      roundToFraction: 0.125,
    });
    expect(n.display).toMatch(/tbsp/);
  });

  it("handles ranges by averaging", () => {
    const [n] = normalizeIngredients(["1 to 2 tsp salt"], {
      unitSystem: "imperial",
      amountFormat: "decimal",
      decimals: 2,
    });
    expect(n.amount).toBeGreaterThan(0);
    expect(n.display).toMatch(/tsp/);
  });
});

