import {
  parseIngredient,
  parseAmount,
  convertUnit,
} from "./ingredient-scaling";

export type NormalizationOptions = {
  unitSystem: "imperial" | "metric";
  amountFormat: "decimal" | "fraction";
  roundToFraction?: number; // e.g., 0.125 for 1/8
  decimals?: number; // for decimal formatting
};

export type CanonicalIngredient = {
  amount: number | null;
  amountMin?: number | null;
  amountMax?: number | null;
  unit: string;
  name: string;
  notes?: string;
  originalText: string;
  display: string;
};

const UNIT_CLASS: Record<string, "volume" | "mass" | "count" | "other"> = {
  tsp: "volume",
  tablespoon: "volume",
  tbsp: "volume",
  cup: "volume",
  ml: "volume",
  l: "volume",
  g: "mass",
  kg: "mass",
  oz: "mass",
  lb: "mass",
  can: "count",
  package: "count",
  pkg: "count",
  jar: "count",
  pinch: "other",
  dash: "other",
  clove: "count",
};

function simplifyFraction(n: number, d: number): [number, number] {
  const g = (a: number, b: number): number => (b ? g(b, a % b) : a);
  const gcd = g(n, d);
  return [n / gcd, d / gcd];
}

function formatAsFraction(value: number, step: number): string {
  const rounded = Math.round(value / step) * step;
  const whole = Math.floor(rounded);
  const frac = rounded - whole;
  if (frac === 0) return `${whole}`;
  const denom = Math.round(1 / step);
  const numer = Math.round(frac * denom);
  const [n, d] = simplifyFraction(numer, denom);
  return whole > 0 ? `${whole} ${n}/${d}` : `${n}/${d}`;
}

export function normalizeIngredientLine(
  line: string,
  options: NormalizationOptions
): CanonicalIngredient {
  const originalText = line.trim();
  const pre = originalText
    .replace(/(\d),(?=\d)/g, "$1.")
    .replace(/[–—−]/g, "-")
    .replace(/\b(about|approx\.?|around|roughly)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // Strip leading bullets/checkboxes like "- ", "• ", "▢ ", "[ ] ", "☐ ", "✓ "
  const preNoBullets = pre.replace(
    /^\s*(?:(?:\[[xX ]?\])|(?:[-–—*•·▪▫◦●□▢■☐✓✔✗✘]))\s+/u,
    ""
  );

  // Tidy spaces around commas
  const preTidy = preNoBullets.replace(/\s+,/g, ", ").replace(/,\s+/g, ", ");

  const rangeMatch = preTidy.match(
    /(?<!\d)(\d+(?:\.\d+)?(?:\s*\d+\/\d+)?)\s*(?:to|-)\s*(\d+(?:\.\d+)?(?:\s*\d+\/\d+)?)(?!\d)/
  );
  const pkgMatch = preTidy.match(
    /\(?\s*(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?\s*(oz|g|ml|lb|kg)\s*\)?\s*(can|package|pkg|jar)s?/i
  );

  const parsed = parseIngredient(preTidy);

  let amount = parsed.amount;
  let amountMin: number | null = null;
  let amountMax: number | null = null;

  if (rangeMatch) {
    amountMin = parseAmount(rangeMatch[1]);
    amountMax = parseAmount(rangeMatch[2]);
    amount = (amountMin + amountMax) / 2;
  }

  // Prefer alternate units after a slash that match the target system (e.g., "500g / 1 lb ...")
  const altMatch = preTidy.match(
    /\/\s*(\d+(?:\.\d+)?(?:\s*\d+\/\d+)?)\s*(oz|lb|g|kg|ml|l)\b/i
  );
  if (altMatch) {
    const altAmount = parseAmount(altMatch[1]);
    const altUnit = altMatch[2].toLowerCase();
    const preferImperial = altUnit === "oz" || altUnit === "lb";
    const preferMetric =
      altUnit === "g" ||
      altUnit === "kg" ||
      altUnit === "ml" ||
      altUnit === "l";
    if (
      (options.unitSystem === "imperial" && preferImperial) ||
      (options.unitSystem === "metric" && preferMetric)
    ) {
      amount = altAmount;
      (parsed as any).unit = altUnit;
    }
  }

  // Clean ingredient name: remove inline alternate units and trailing "or ..." phrases
  let ingredientName = parsed.ingredient
    // remove slash-based alternate units like "/ 1 lb"
    .replace(/\s*\/\s*\d+(?:[\d\/\.\s-]*)\s*(oz|lb|g|kg|ml|l)\b/gi, "")
    // remove parenthetical alternate units like "(625 ml)" or "(14 oz can)"
    .replace(
      /\(\s*\d+(?:[\d\/\.\s-]*)\s*(oz|lb|g|kg|ml|l)(?:\s*can)?\s*\)/gi,
      ""
    )
    // remove inline " or ..." phrase before any parentheses
    .replace(/\s+or\s+[^()]+(?=$|\s*\()/i, "")
    // tidy commas and spaces
    .replace(/\s+,/g, ", ")
    .replace(/,\s+/g, ", ")
    .replace(/\s{2,}/g, " ")
    .trim();

  let pkgNote: string | undefined;
  if (pkgMatch) {
    const size = parseFloat(pkgMatch[1]);
    const unit = pkgMatch[3].toLowerCase();
    const label = pkgMatch[4].toLowerCase();
    const noteText = `${size} ${unit} ${label}`.replace(/\s+/g, " ").trim();
    // Only add if not already present in the cleaned ingredient name
    const re = new RegExp(
      noteText.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
      "i"
    );
    if (!re.test(ingredientName)) {
      pkgNote = `(${noteText})`;
    }
  }

  const unitClass = UNIT_CLASS[parsed.unit] || "other";
  let canonicalUnit = parsed.unit;

  if (amount && unitClass === "volume") {
    canonicalUnit = options.unitSystem === "metric" ? "ml" : "tsp";
    amount = convertUnit(amount, parsed.unit, canonicalUnit).amount;
  } else if (amount && unitClass === "mass") {
    if (options.unitSystem === "metric") {
      canonicalUnit = "g";
      amount = convertUnit(amount, parsed.unit, canonicalUnit).amount;
      amount = Math.round(amount); // whole grams
    } else {
      // imperial mass: prefer lb if heavy, else oz
      let ozAmount = convertUnit(amount, parsed.unit, "oz").amount;
      if (ozAmount >= 16) {
        canonicalUnit = "lb";
        const lbAmount = convertUnit(ozAmount, "oz", "lb").amount;
        const step = 0.25; // quarter-pound increments
        amount = Math.round(lbAmount / step) * step;
      } else {
        canonicalUnit = "oz";
        amount = Math.round(ozAmount); // whole ounces
      }
    }
  } else if (unitClass === "count") {
    canonicalUnit = parsed.unit || "";
  } else {
    canonicalUnit = parsed.unit || "";
  }

  const formattedAmount = amount
    ? options.amountFormat === "fraction"
      ? formatAsFraction(amount, options.roundToFraction ?? 0.125)
      : (amount as number).toFixed(options.decimals ?? 2).replace(/\.00$/, "")
    : "";

  const parts = [formattedAmount, canonicalUnit, ingredientName].filter(
    Boolean
  );
  if (pkgNote) parts.push(pkgNote);

  const display = parts
    .join(" ")
    .replace(/\s+/g, " ")
    // collapse duplicate identical parentheses e.g., (14 oz can) (14 oz can)
    .replace(/\(\s*([^)]*?)\s*\)\s*\(\s*\1\s*\)/g, "($1)")
    .trim();

  return {
    amount: amount || null,
    amountMin,
    amountMax,
    unit: canonicalUnit,
    name: ingredientName,
    notes: !parsed.amount && !parsed.unit ? "no-quantity" : undefined,
    originalText,
    display,
  };
}

export function normalizeIngredients(
  lines: string[],
  options: NormalizationOptions = {
    unitSystem: "imperial",
    amountFormat: "fraction",
    roundToFraction: 0.125,
  }
): CanonicalIngredient[] {
  // Split inline bullets/checkboxes inside a single line into separate entries
  // Avoid splitting on hyphens/dashes to preserve ranges like "3-6 lbs"
  const bulletSplitter = /(?:\s*\[[xX ]?\]\s*|\s*[•·▪▫◦●□▢■☐]\s*)/u;
  const exploded = lines
    .flatMap((l) => l.split(bulletSplitter))
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const normalized = exploded.map((l) => normalizeIngredientLine(l, options));
  // Drop standalone continuation lines that start with "or " and have no amount
  let filtered = normalized.filter(
    (n) => !(n.amount === null && /^\s*or\b/i.test(n.originalText))
  );
  // Drop numeric-only fragments with no ingredient name (e.g., stray "3")
  filtered = filtered.filter((n) => (n.name || "").trim().length > 0);

  // Deduplicate by display (case-insensitive)
  const seen = new Set<string>();
  const uniq: CanonicalIngredient[] = [];
  for (const item of filtered) {
    const key = item.display.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniq.push(item);
    }
  }
  return uniq;
}
