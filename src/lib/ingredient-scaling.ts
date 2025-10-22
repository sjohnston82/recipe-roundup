// Measurement conversion constants
const MEASUREMENT_CONVERSIONS: Record<string, number> = {
  // Volume conversions (all to teaspoons as base unit)
  teaspoon: 1,
  tsp: 1,
  tablespoon: 3,
  tbsp: 3,
  "fluid ounce": 6,
  "fl oz": 6,
  cup: 48,
  pint: 96,
  quart: 192,
  gallon: 768,

  // Weight conversions (all to ounces as base unit)
  ounce: 1,
  oz: 1,
  pound: 16,
  lb: 16,
  gram: 0.035274,
  g: 0.035274,
  kilogram: 35.274,
  kg: 35.274,
};

// Common measurement abbreviations and their full forms
const MEASUREMENT_ALIASES: Record<string, string> = {
  t: "tsp",
  T: "tbsp",
  c: "cup",
  pt: "pint",
  qt: "quart",
  gal: "gallon",
  "fl. oz": "fl oz",
  "fluid oz": "fl oz",
  lbs: "lb",
  pounds: "pound",
  ounces: "ounce",
  teaspoons: "teaspoon",
  tablespoons: "tablespoon",
  cups: "cup",
  pints: "pint",
  quarts: "quart",
  gallons: "gallon",
  grams: "gram",
  kilograms: "kilogram",
};

export interface ParsedIngredient {
  amount: number;
  unit: string;
  ingredient: string;
  originalText: string;
}

// Parse ingredient text to extract amount, unit, and ingredient name
export function parseIngredient(ingredientText: string): ParsedIngredient {
  const text = ingredientText.trim();

  // Regex to match various number formats including fractions and Unicode fractions
  const numberRegex =
    /^(\d+\s+\d+\/\d+|\d+\s*[½¼¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\d*\s*\d+\/\d+|[½¼¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\d+(?:\.\d+)?(?!\s*\d+\/\d+))/;
  const match = text.match(numberRegex);

  if (!match) {
    // No number found, return as-is
    return {
      amount: 0,
      unit: "",
      ingredient: text,
      originalText: text,
    };
  }

  const amountStr = match[1].trim();
  const remainingText = text.slice(match[0].length).trim();

  // Convert fraction or mixed number to decimal
  const amount = parseAmount(amountStr);

  // Extract unit from the beginning of remaining text
  const unitMatch = remainingText.match(/^([a-zA-Z\.\s]+)/);
  let unit = "";
  let ingredient = remainingText;

  if (unitMatch) {
    const potentialUnit = unitMatch[1].trim().toLowerCase();
    // Check if it's a known unit
    if (
      MEASUREMENT_CONVERSIONS[potentialUnit] ||
      MEASUREMENT_ALIASES[potentialUnit]
    ) {
      unit = potentialUnit;
      ingredient = remainingText.slice(unitMatch[0].length).trim();
    }
  }

  return {
    amount,
    unit,
    ingredient,
    originalText: text,
  };
}

// Convert fraction strings to decimal numbers
export function parseAmount(amountStr: string): number {
  amountStr = amountStr.trim();

  // Unicode fraction mappings
  const unicodeFractions: Record<string, number> = {
    "½": 0.5,
    "¼": 0.25,
    "¾": 0.75,
    "⅐": 1 / 7,
    "⅑": 1 / 9,
    "⅒": 0.1,
    "⅓": 1 / 3,
    "⅔": 2 / 3,
    "⅕": 0.2,
    "⅖": 0.4,
    "⅗": 0.6,
    "⅘": 0.8,
    "⅙": 1 / 6,
    "⅚": 5 / 6,
    "⅛": 0.125,
    "⅜": 0.375,
    "⅝": 0.625,
    "⅞": 0.875,
  };

  // Handle mixed numbers with Unicode fractions (e.g., "1½", "2¼")
  const mixedUnicodeMatch = amountStr.match(/^(\d+)\s*([½¼¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])$/);
  if (mixedUnicodeMatch) {
    const whole = parseInt(mixedUnicodeMatch[1]);
    const fractionChar = mixedUnicodeMatch[2];
    return whole + (unicodeFractions[fractionChar] || 0);
  }

  // Handle pure Unicode fractions (e.g., "½", "¼")
  if (unicodeFractions[amountStr]) {
    return unicodeFractions[amountStr];
  }

  // Handle mixed numbers (e.g., "1 1/2")
  const mixedMatch = amountStr.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1]);
    const numerator = parseInt(mixedMatch[2]);
    const denominator = parseInt(mixedMatch[3]);
    return whole + numerator / denominator;
  }

  // Handle hyphenated mixed numbers (e.g., "1-1/2")
  const hyphenMixed = amountStr.match(/^(\d+)-(\d+)\/(\d+)$/);
  if (hyphenMixed) {
    const whole = parseInt(hyphenMixed[1]);
    const numerator = parseInt(hyphenMixed[2]);
    const denominator = parseInt(hyphenMixed[3]);
    return whole + numerator / denominator;
  }

  // Handle simple fractions (e.g., "1/2")
  const fractionMatch = amountStr.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1]);
    const denominator = parseInt(fractionMatch[2]);
    return numerator / denominator;
  }

  // Handle decimal numbers
  return parseFloat(amountStr) || 0;
}

// Convert decimal to fraction string for display
function toFraction(decimal: number, tolerance = 1e-6): string {
  if (decimal === 0) return "0";

  if (decimal > 100 || decimal < 0.01) {
    // For very large or small numbers, or if precision is not critical,
    // return a formatted decimal string to avoid weird fractions.
    return parseFloat(decimal.toPrecision(15)).toString();
  }

  let h1 = 1,
    h2 = 0,
    k1 = 0,
    k2 = 1;
  let b = decimal;

  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(decimal - h1 / k1) > tolerance);

  // Limit denominator to reasonable values for recipes
  if (k1 > 32) {
    return parseFloat(decimal.toPrecision(15)).toString();
  }

  const whole = Math.floor(h1 / k1);
  const remainder = h1 % k1;

  if (remainder === 0) {
    return whole.toString();
  } else if (whole === 0) {
    return `${remainder}/${k1}`;
  } else {
    return `${whole} ${remainder}/${k1}`;
  }
}

// Format amount for display, preferring fractions for common values
function formatAmount(amount: number): string {
  if (amount === 0) return "0";
  return toFraction(amount);
}

// Get the normalized unit name
function getNormalizedUnit(unit: string): string {
  const lowerUnit = unit.toLowerCase();
  return MEASUREMENT_ALIASES[lowerUnit] || lowerUnit;
}

// Convert between units of the same type (volume or weight)
export function convertUnit(
  amount: number,
  fromUnit: string,
  toUnit: string
): { amount: number; unit: string } {
  const normalizedFrom = getNormalizedUnit(fromUnit);
  const normalizedTo = getNormalizedUnit(toUnit);

  const fromConversion = MEASUREMENT_CONVERSIONS[normalizedFrom];
  const toConversion = MEASUREMENT_CONVERSIONS[normalizedTo];

  if (!fromConversion || !toConversion) {
    // Can't convert, return original
    return { amount, unit: fromUnit };
  }

  // Convert to base unit, then to target unit
  const baseAmount = amount * fromConversion;
  const convertedAmount = baseAmount / toConversion;

  return { amount: convertedAmount, unit: toUnit };
}

// Find the best unit for display based on the scaled amount
function findBestUnit(amount: number, originalUnit: string): string {
  const normalizedUnit = getNormalizedUnit(originalUnit);

  // Volume conversions - convert to larger units when appropriate
  if (["teaspoon", "tsp"].includes(normalizedUnit)) {
    if (amount >= 3) {
      const tbspAmount = amount / 3;
      if (tbspAmount >= 16) {
        return "cup";
      } else if (tbspAmount >= 1) {
        return "tbsp";
      }
    }
    return originalUnit;
  }

  if (["tablespoon", "tbsp"].includes(normalizedUnit)) {
    if (amount >= 16) {
      return "cup";
    }
    return originalUnit;
  }

  if (normalizedUnit === "cup") {
    if (amount >= 4) {
      return "quart";
    } else if (amount >= 2) {
      return "pint";
    }
    return originalUnit;
  }

  // Weight conversions
  if (["ounce", "oz"].includes(normalizedUnit)) {
    if (amount >= 16) {
      return "lb";
    }
    return originalUnit;
  }

  return originalUnit;
}

// Main function to scale an ingredient
export function scaleIngredient(ingredientText: string, scale: number): string {
  if (scale === 1) return ingredientText;

  const parsed = parseIngredient(ingredientText);

  if (parsed.amount === 0) {
    // No amount to scale
    return ingredientText;
  }

  const scaledAmount = parsed.amount * scale;

  if (!parsed.unit) {
    // No unit, just scale the number - reconstruct the whole string
    const formattedAmount = formatAmount(scaledAmount);
    return `${formattedAmount} ${parsed.ingredient}`.trim();
  }

  // Find the best unit for the scaled amount
  const bestUnit = findBestUnit(scaledAmount, parsed.unit);

  let finalAmount = scaledAmount;
  let finalUnit = parsed.unit;

  // Convert to the best unit if different
  if (bestUnit !== parsed.unit) {
    const converted = convertUnit(scaledAmount, parsed.unit, bestUnit);
    finalAmount = converted.amount;
    finalUnit = converted.unit;
  }

  // Reconstruct the ingredient string completely
  const formattedAmount = formatAmount(finalAmount);
  return `${formattedAmount} ${finalUnit} ${parsed.ingredient}`.trim();
}

// Scale servings
export function scaleServings(
  servings: string | null,
  scale: number
): string | null {
  if (!servings || scale === 1) return servings;

  const numericServings = parseInt(servings);
  if (isNaN(numericServings)) return servings;

  return (numericServings * scale).toString();
}
