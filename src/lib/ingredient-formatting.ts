import React from "react";

// Regular expression to match measurements at the start, including:
// - Mixed standard fractions: "1 1/2", "5 1/4"
// - Unicode fractions: "1½", "½"
// - Simple fractions/decimals/integers: "3/4", "1.5", "2"
// - Optional range: "5 1/4 - 6", "1-2", or "1 to 2"
// - Optional unit after each number (e.g., "lbs", "cups", etc.)
const MEASUREMENT_REGEX = (() => {
  const amount =
    "(?:" +
    // mixed standard fraction (e.g., 1 1/2)
    "\\d+(?:\\s+\\d+\\/\\d+)?|" +
    // unicode mixed (e.g., 1½) or unicode alone (e.g., ½)
    "\\d+\\s*[½¼¾⅓⅔⅛⅜⅝⅞]|[½¼¾⅓⅔⅛⅜⅝⅞]|" +
    // simple fraction or decimal/integer
    "\\d+\\/\\d+|\\d+(?:\\.\\d+)?" +
    ")";

  const units =
    "(?:cups?|c|tablespoons?|tbsp|teaspoons?|tsp|pounds?|lbs?|ounces?|oz|grams?|g|kilograms?|kg|milliliters?|ml|liters?|l|pints?|pt|quarts?|qt|gallons?|gal|inches?|in|feet|ft|cloves?|pieces?|slices?|whole|large|medium|small|pinch|dash)";

  // first amount with optional unit
  const first = `(?:${amount})(?:\\s*(?:${units}))?`;
  // optional range part: "-" or "to" followed by second amount with optional unit
  const range = `(?:\\s*(?:-|to)\\s*(?:${amount})(?:\\s*(?:${units}))?)?`;

  return new RegExp(`^((?:${first})${range})\\s+`, "i");
})();

export function formatIngredientWithBoldMeasurements(
  ingredient: string
): React.ReactNode {
  const match = ingredient.match(MEASUREMENT_REGEX);

  if (match) {
    const measurement = match[1];
    const rest = ingredient.slice(match[0].length);

    return React.createElement(
      React.Fragment,
      null,
      React.createElement("strong", null, measurement),
      " " + rest
    );
  }

  return ingredient;
}
