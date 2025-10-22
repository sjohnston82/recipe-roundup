import { JSDOM } from "jsdom";
import { normalizeIngredients } from "../lib/ingredients";

const SCRAPER_PROXY_URL = process.env.SCRAPER_PROXY_URL || "";
const SCRAPER_PROXY_KEY =
  process.env.SCRAPER_PROXY_KEY || process.env.SCRAPING_API_KEY || "";

function buildProxiedUrl(originalUrl: string): string | null {
  if (!SCRAPER_PROXY_URL || !SCRAPER_PROXY_KEY) return null;
  // Generic proxy pattern: base?api_key=KEY&url=ENCODED
  const sep = SCRAPER_PROXY_URL.includes("?") ? "&" : "?";
  return `${SCRAPER_PROXY_URL}${sep}api_key=${encodeURIComponent(
    SCRAPER_PROXY_KEY
  )}&url=${encodeURIComponent(originalUrl)}`;
}

export const DEFAULT_SELECTORS = {
  title: [
    '[itemProp="name"]',
    'h1[class*="recipe"]',
    'h1[class*="title"]',
    ".recipe-title",
    ".entry-title",
    "h1",
  ],
  description: [
    '[itemProp="description"]',
    ".recipe-description",
    ".recipe-summary",
    ".entry-summary",
    'meta[name="description"]',
  ],
  ingredients: [
    '[itemProp="recipeIngredient"]',
    ".recipe-ingredients li",
    ".ingredients li",
    ".recipe-ingredient",
    ".ingredient",
    '[class*="ingredient"]:not([class*="group"]):not([class*="section"])',
    ".ingredients p",
    ".ingredient-list li",
    ".wprm-recipe-ingredients li",
    ".wprm-recipe-ingredient",
    ".tasty-recipes-ingredients li",
    ".mv-ingredients li",
    ".sp-recipe-ingredients li",
    ".recipe-card-ingredient",
  ],
  instructions: [
    '[itemProp="recipeInstructions"]',
    ".recipe-instructions li",
    ".instructions li",
    ".recipe-instruction",
    ".instruction",
    ".directions li",
    ".recipe-directions li",
    '[class*="instruction"]:not([class*="group"]):not([class*="section"])',
    ".instructions p",
    ".directions p",
    ".method li",
    ".recipe-method li",
    ".wprm-recipe-instructions li",
    ".wprm-recipe-instruction",
    ".tasty-recipes-instructions li",
    ".mv-instructions li",
    ".sp-recipe-instructions li",
  ],
  prepTime: [
    '[itemProp="prepTime"]',
    ".prep-time",
    ".recipe-prep-time",
    '[class*="prep"]',
  ],
  cookTime: [
    '[itemProp="cookTime"]',
    ".cook-time",
    ".recipe-cook-time",
    '[class*="cook"]',
  ],
  servings: [
    '[itemProp="recipeYield"]',
    ".servings",
    ".recipe-servings",
    ".yield",
    '[class*="serving"]',
  ],
  image: [
    '[itemProp="image"]',
    ".recipe-image img",
    ".featured-image img",
    ".entry-image img",
    'img[class*="recipe"]',
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
  ],
  cuisine: [
    '[itemProp="recipeCuisine"]',
    ".cuisine",
    ".recipe-cuisine",
    '[class*="cuisine"]',
  ],
  nutrition: [
    '[itemProp="nutrition"]',
    ".nutrition-facts",
    ".recipe-nutrition",
    ".nutritional-info",
    '[class*="nutrition"]',
    ".nutrition-table",
    ".nutrition-info",
  ],
  calories: [
    '[itemProp="calories"]',
    ".calories",
    '[class*="calorie"]',
    ".nutrition-calories",
  ],
  protein: ['[itemProp="proteinContent"]', ".protein", '[class*="protein"]'],
  fat: ['[itemProp="fatContent"]', ".fat", '[class*="fat"]'],
  fiber: ['[itemProp="fiberContent"]', ".fiber", '[class*="fiber"]'],
  sugar: ['[itemProp="sugarContent"]', ".sugar", '[class*="sugar"]'],
  sodium: ['[itemProp="sodiumContent"]', ".sodium", '[class*="sodium"]'],
} as const;

export interface SelectorResult {
  value: string | string[];
  selector: string | null;
  source: "ld-json" | "selector";
}

export interface ScrapingResults {
  title: SelectorResult;
  description: SelectorResult;
  ingredients: SelectorResult;
  instructions: SelectorResult;
  prepTime: SelectorResult;
  cookTime: SelectorResult;
  servings: SelectorResult;
  image: SelectorResult;
  cuisine: SelectorResult;
  nutrition: SelectorResult;
}

function cleanText(text: string): string {
  return text
    .replace(/1x2x3x/g, "")
    .replace(/\s+/g, " ")
    .replace(/[\u00A0\u2000-\u200B\u2028\u2029]/g, " ")
    .replace(/\n+/g, " ")
    .trim();
}

function isValidIngredient(text: string): boolean {
  const cleaned = text.toLowerCase().trim();
  if (cleaned.length < 3 || /^[\d\s\-\.,]+$/.test(cleaned)) return false;
  if (text.length > 150) return false;
  if (cleaned.startsWith("ingredients")) return false;
  const skipPatterns = [
    /^ingredients?$/i,
    /^directions?$/i,
    /^instructions?$/i,
    /^method$/i,
    /^preparation$/i,
    /^steps?$/i,
    /^recipe$/i,
    /^serves?\s*\d*/i,
    /^yield/i,
    /^prep time/i,
    /^cook time/i,
    /^total time/i,
    /^difficulty/i,
    /^cuisine/i,
    /^category/i,
    /^course/i,
    /^diet/i,
    /^for the/i,
    /^advertisement$/i,
    /^sponsored$/i,
    /^print recipe$/i,
    /^save recipe$/i,
    /^share$/i,
    /^rating/i,
    /^reviews?$/i,
    /^comments?$/i,
    /^nutrition/i,
    /^calories/i,
    /^\d+\s*servings?$/i,
    /^\d+\s*portions?$/i,
  ];
  return !skipPatterns.some((p) => p.test(cleaned));
}

function isValidInstruction(text: string): boolean {
  const cleaned = text.toLowerCase().trim();
  if (cleaned.length < 10) return false;
  if (text.length > 500) return false;
  if (cleaned.startsWith("instructions") || cleaned.startsWith("directions"))
    return false;
  const skipPatterns = [
    /^ingredients?$/i,
    /^directions?$/i,
    /^instructions?$/i,
    /^method$/i,
    /^preparation$/i,
    /^steps?$/i,
    /^recipe$/i,
    /^notes?$/i,
    /^tips?$/i,
    /^advertisement$/i,
    /^sponsored$/i,
    /^print recipe$/i,
    /^save recipe$/i,
    /^share$/i,
    /^rating/i,
    /^reviews?$/i,
    /^comments?$/i,
    /^nutrition/i,
    /^chef'?s? notes?$/i,
    /^cook'?s? tips?$/i,
  ];
  return !skipPatterns.some((p) => p.test(cleaned));
}

function removeDuplicates(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const normalized = item.toLowerCase().trim().replace(/\s+/g, " ");
    if (seen.has(normalized)) continue;
    const isDuplicate = Array.from(seen).some((seenItem) => {
      if (
        normalized.length > seenItem.length * 1.5 &&
        normalized.includes(seenItem)
      )
        return true;
      if (
        seenItem.length > normalized.length * 1.5 &&
        seenItem.includes(normalized)
      )
        return true;
      return false;
    });
    if (!isDuplicate) {
      seen.add(normalized);
      result.push(item.trim());
    }
  }
  return result;
}

function extractTextContent(element: Element | null): string {
  if (!element) return "";
  return cleanText(element.textContent || "");
}

function extractAttribute(element: Element | null, attribute: string): string {
  if (!element) return "";
  return cleanText(element.getAttribute(attribute) || "");
}

function parseTimeToMinutes(timeStr: string): string | null {
  if (!timeStr) return null;
  const isoDuration = timeStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (isoDuration) {
    const hours = parseInt(isoDuration[1] || "0");
    const minutes = parseInt(isoDuration[2] || "0");
    return (hours * 60 + minutes).toString();
  }
  const numbers = timeStr.match(/\d+/g);
  if (numbers) {
    if (timeStr.toLowerCase().includes("hour"))
      return (parseInt(numbers[0]) * 60).toString();
    return numbers[0];
  }
  return null;
}

function safeJsonParse<T = any>(input: string | null | undefined): T | null {
  if (!input || typeof input !== "string") return null;
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}

function trySelectors(
  document: Document,
  selectors: string[]
): { element: Element | null; selector: string | null } {
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (
        element &&
        (element.textContent?.trim() ||
          element.getAttribute("content") ||
          element.getAttribute("src"))
      ) {
        return { element, selector };
      }
    } catch {}
  }
  return { element: null, selector: null };
}

function trySelectorsAll(
  document: Document,
  selectors: string[]
): { elements: Element[]; selector: string | null } {
  for (const selector of selectors) {
    try {
      const elements = Array.from(document.querySelectorAll(selector));
      if (
        elements.length > 0 &&
        elements.some((el) => el.textContent?.trim())
      ) {
        return {
          elements: elements.filter((el) => el.textContent?.trim()),
          selector,
        };
      }
    } catch {}
  }
  return { elements: [], selector: null };
}

function extractFromLDJSON(document: Document): Partial<ScrapingResults> {
  const results: Partial<ScrapingResults> = {};
  const ldJsonScripts = document.querySelectorAll(
    'script[type="application/ld+json"]'
  );
  for (const script of ldJsonScripts) {
    const raw = script.textContent || "";
    const candidates: any[] = [];
    const strict = safeJsonParse<any>(raw);
    if (strict) candidates.push(strict);
    if (!strict) {
      const repaired = `[${raw.replace(/}\s*{/g, "},{")}]`;
      const repairedParsed = safeJsonParse<any>(repaired);
      if (repairedParsed) candidates.push(repairedParsed);
    }
    if (candidates.length === 0) continue;
    for (const jsonData of candidates) {
      const rootItems = Array.isArray(jsonData) ? jsonData : [jsonData];
      const recipes = rootItems.flatMap((item) =>
        Array.isArray((item as any)["@graph"])
          ? (item as any)["@graph"]
          : [item]
      );
      for (const data of recipes as any[]) {
        const type = data["@type"];
        const isRecipe =
          type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"));
        if (!isRecipe) continue;
        if (data.name && !results.title)
          results.title = {
            value: cleanText(data.name),
            selector: null,
            source: "ld-json",
          };
        if (data.description && !results.description)
          results.description = {
            value: cleanText(data.description),
            selector: null,
            source: "ld-json",
          };
        if (data.recipeIngredient && !results.ingredients) {
          const ingredients = Array.isArray(data.recipeIngredient)
            ? data.recipeIngredient
            : [data.recipeIngredient];
          const cleanedIngredients = ingredients
            .map((ing: any) =>
              cleanText(typeof ing === "string" ? ing : String(ing))
            )
            .filter(isValidIngredient);
          results.ingredients = {
            value: removeDuplicates(cleanedIngredients),
            selector: null,
            source: "ld-json",
          };
        }
        if (data.recipeInstructions && !results.instructions) {
          let instructions: string[] = [];
          const pushStep = (node: any) => {
            if (!node) return;
            if (typeof node === "string") {
              const t = cleanText(node);
              if (isValidInstruction(t)) instructions.push(t);
              return;
            }
            if (node.text) {
              const t = cleanText(node.text);
              if (isValidInstruction(t)) instructions.push(t);
            } else if (node.name) {
              const t = cleanText(node.name);
              if (isValidInstruction(t)) instructions.push(t);
            }
          };
          if (Array.isArray(data.recipeInstructions)) {
            for (const item of data.recipeInstructions) {
              if (
                item &&
                item.itemListElement &&
                Array.isArray(item.itemListElement)
              ) {
                for (const sub of item.itemListElement) pushStep(sub);
              } else {
                pushStep(item);
              }
            }
          } else if (typeof data.recipeInstructions === "string") {
            const cleaned = cleanText(data.recipeInstructions);
            if (isValidInstruction(cleaned)) instructions.push(cleaned);
          }
          if (instructions.length > 0)
            results.instructions = {
              value: removeDuplicates(instructions),
              selector: null,
              source: "ld-json",
            };
        }
        if (data.prepTime && !results.prepTime) {
          const parsed = parseTimeToMinutes(data.prepTime);
          if (parsed)
            results.prepTime = {
              value: parsed,
              selector: null,
              source: "ld-json",
            };
        }
        if (data.cookTime && !results.cookTime) {
          const parsed = parseTimeToMinutes(data.cookTime);
          if (parsed)
            results.cookTime = {
              value: parsed,
              selector: null,
              source: "ld-json",
            };
        }
        if (data.recipeYield && !results.servings) {
          const yield_ = Array.isArray(data.recipeYield)
            ? data.recipeYield[0]
            : data.recipeYield;
          const servingsMatch = yield_?.toString().match(/\d+/);
          if (servingsMatch)
            results.servings = {
              value: servingsMatch[0],
              selector: null,
              source: "ld-json",
            };
        }
        if (data.image && !results.image) {
          let imageUrl = "";
          if (Array.isArray(data.image))
            imageUrl = data.image[0]?.url || data.image[0] || "";
          else if (typeof data.image === "object")
            imageUrl = data.image.url || "";
          else imageUrl = data.image;
          if (imageUrl)
            results.image = {
              value: imageUrl,
              selector: null,
              source: "ld-json",
            };
        }
        if (data.recipeCuisine && !results.cuisine) {
          const cuisine = Array.isArray(data.recipeCuisine)
            ? data.recipeCuisine[0]
            : data.recipeCuisine;
          results.cuisine = {
            value: cleanText(cuisine),
            selector: null,
            source: "ld-json",
          };
        }
      }
    }
  }
  return results;
}

export async function scrapeRecipe(
  url: string,
  customSelectors?: any
): Promise<{ data: any; results: ScrapingResults }> {
  // Helpers
  const fetchWithDesktopHeaders = async (requestUrl: string) =>
    fetch(requestUrl, {
      headers: {
        // Pretend to be a real desktop Chrome
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: new URL(requestUrl).origin,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        DNT: "1",
        "Upgrade-Insecure-Requests": "1",
        // Some sites are picky about sec headers
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Dest": "document",
      },
    });

  const fetchViaReader = async (requestUrl: string) => {
    const bare = requestUrl.replace(/^https?:\/\//, "");
    const readerUrl = `https://r.jina.ai/http://${bare}`;
    const readerResp = await fetch(readerUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "text/plain, text/html;q=0.9, */*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!readerResp.ok) {
      throw new Error(`HTTP error! status: ${readerResp.status}`);
    }
    return await readerResp.text();
  };

  // As an extra fallback for hard 451/geo blocks, proxy the reader URL itself through the reader again
  const fetchViaDoubleReader = async (requestUrl: string) => {
    const bareOnce = requestUrl.replace(/^https?:\/\//, "");
    const firstReader = `https://r.jina.ai/http://${bareOnce}`;
    const bareTwice = firstReader.replace(/^https?:\/\//, "");
    const doubleReader = `https://r.jina.ai/http://${bareTwice}`;
    const resp = await fetch(doubleReader, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "text/plain, text/html;q=0.9, */*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!resp.ok) return null;
    return await resp.text();
  };

  const tryAmpVariants = async (requestUrl: string) => {
    const base = new URL(requestUrl);
    const variants: string[] = [];
    // /amp variant
    const ampUrl = new URL(base.toString());
    if (ampUrl.pathname.endsWith("/")) ampUrl.pathname += "amp";
    else ampUrl.pathname += "/amp";
    variants.push(ampUrl.toString());
    // ?amp variant
    const qAmp = new URL(base.toString());
    qAmp.searchParams.set("amp", "1");
    variants.push(qAmp.toString());
    // ?output=amp variant
    const qOutAmp = new URL(base.toString());
    qOutAmp.searchParams.set("output", "amp");
    variants.push(qOutAmp.toString());

    for (const v of variants) {
      try {
        const resp = await fetchWithDesktopHeaders(v);
        if (resp.ok) {
          return await resp.text();
        }
      } catch {}
    }
    return null;
  };

  const parseFromReadableText = (text: string) => {
    // Attempt to extract sections by headings in readable text
    const lines = text.split(/\r?\n/).map((l) => l.trim());
    const nonEmpty = lines.filter((l) => l.length > 0);
    const findIndex = (re: RegExp) => nonEmpty.findIndex((l) => re.test(l));
    const ingIdx = findIndex(/^(ingredients|for the ingredients)/i);
    const instIdx = findIndex(
      /^(instructions|directions|method|preparation|how to)/i
    );
    const stopIdx = (start: number) => {
      if (start < 0) return nonEmpty.length;
      const nextHeading = nonEmpty
        .slice(start + 1)
        .findIndex((l) =>
          /^(instructions|directions|method|notes|nutrition|video|tips|equipment)/i.test(
            l
          )
        );
      return nextHeading < 0 ? nonEmpty.length : start + 1 + nextHeading;
    };

    let title = "";
    const ignoreTitle =
      /^(home|browse|videos|about|subscribe|search|jump to recipe|pin recipe|leave a review|sign up|get the latest|damn\s+delicious)$/i;
    // Prefer a line near the ingredients heading if present
    if (ingIdx > 1) {
      for (let i = ingIdx - 1; i >= Math.max(0, ingIdx - 6); i--) {
        const candidate = nonEmpty[i];
        if (candidate.length > 4 && !ignoreTitle.test(candidate)) {
          title = candidate;
          break;
        }
      }
    }
    // Fallback: choose a reasonable title near the top
    if (!title) {
      for (let i = 0; i < Math.min(80, nonEmpty.length); i++) {
        const candidate = nonEmpty[i];
        if (
          candidate.length > 4 &&
          !ignoreTitle.test(candidate) &&
          /\b\w+\b.*\b\w+\b/.test(candidate)
        ) {
          title = candidate;
          break;
        }
      }
    }
    if (/^title:\s*/i.test(title)) {
      title = title.replace(/^title:\s*/i, "").trim();
    }

    let ingredients: string[] = [];
    if (ingIdx >= 0) {
      const end = Math.min(
        stopIdx(ingIdx),
        instIdx >= 0 ? instIdx : nonEmpty.length
      );
      const slice = nonEmpty.slice(ingIdx + 1, end);
      const bulletOrNumberPrefix =
        /^(?:\d+[.)]\s*|[-*•\u2022\u2023\u25E6\u2043\u2219]\s+)/;
      ingredients = slice
        .filter((l) => bulletOrNumberPrefix.test(l) || /\d/.test(l))
        .map((l) => l.replace(bulletOrNumberPrefix, "").trim())
        .filter(isValidIngredient);
    }

    let instructions: string[] = [];
    if (instIdx >= 0) {
      const end = stopIdx(instIdx);
      const slice = nonEmpty.slice(instIdx + 1, end);
      instructions = slice
        .filter((l) => l.length > 8)
        .map((l) => l.replace(/^\d+[.)]?\s*|^[-*•]\s*/, "").trim())
        .filter(isValidInstruction);
    } else if (ingIdx >= 0) {
      // If no explicit instructions heading, try to consume lines after ingredients block
      const afterIngStart = Math.min(nonEmpty.length, ingIdx + 1 + 20); // start a bit after ingredients heading
      const slice = nonEmpty.slice(afterIngStart, afterIngStart + 60);
      instructions = slice
        .map((l) => l.replace(/^\d+[.)]?\s*|^[-*•]\s*/, "").trim())
        .filter((l) => l.length > 8)
        .filter(isValidInstruction);
    }

    return {
      title,
      ingredients: removeDuplicates(ingredients),
      instructions: removeDuplicates(instructions),
    };
  };

  // Try direct fetch first with robust headers
  let html: string | null = null;
  let usedReaderFallback = false;
  try {
    // If configured, use a scraping proxy service first to avoid blocks
    const proxied = buildProxiedUrl(url);
    const response = await fetchWithDesktopHeaders(proxied || url);
    if (!response.ok) {
      if (
        response.status === 403 ||
        response.status === 406 ||
        response.status === 451
      ) {
        // Try AMP variants before reader fallback
        const ampHtml = await tryAmpVariants(proxied || url);
        if (ampHtml) {
          html = ampHtml;
        } else {
          usedReaderFallback = true;
          html = await fetchViaReader(url);
          if (!html) {
            html = await fetchViaDoubleReader(url);
          }
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } else {
      html = await response.text();
    }
  } catch (e) {
    if (!html) {
      // Network failure; try AMP then reader
      const ampHtml = await tryAmpVariants(url);
      if (ampHtml) html = ampHtml;
      else {
        usedReaderFallback = true;
        html = await fetchViaReader(url);
        if (!html) {
          html = await fetchViaDoubleReader(url);
        }
      }
    }
  }

  if (!html) throw new Error("Failed to load page content");

  let document: Document | null = null;
  if (!usedReaderFallback) {
    const dom = new JSDOM(html);
    document = dom.window.document;
  }

  const selectors = customSelectors || DEFAULT_SELECTORS;

  const results: ScrapingResults = {
    title: { value: "", selector: null, source: "selector" },
    description: { value: "", selector: null, source: "selector" },
    ingredients: { value: [], selector: null, source: "selector" },
    instructions: { value: [], selector: null, source: "selector" },
    prepTime: { value: "", selector: null, source: "selector" },
    cookTime: { value: "", selector: null, source: "selector" },
    servings: { value: "", selector: null, source: "selector" },
    image: { value: "", selector: null, source: "selector" },
    cuisine: { value: "", selector: null, source: "selector" },
    nutrition: { value: "", selector: null, source: "selector" },
  };

  if (!usedReaderFallback && document) {
    const ldJsonResults = extractFromLDJSON(document);
    if (ldJsonResults.title) results.title = ldJsonResults.title;
    if (ldJsonResults.description)
      results.description = ldJsonResults.description;
    if (ldJsonResults.ingredients) {
      results.ingredients = ldJsonResults.ingredients;
    } else {
      const { elements, selector } = trySelectorsAll(
        document,
        selectors.ingredients
      );
      let ingredients = elements
        .map((el) => extractTextContent(el))
        .flatMap((text) => text.split(/\r?\n|\u2028|\u2029/))
        .map((t) => t.replace(/^\s*[•·▪▫◦●□▢■☐-]\s*/u, "").trim())
        .filter((text) => text.length > 0)
        .filter(isValidIngredient);
      ingredients = removeDuplicates(ingredients);
      results.ingredients = {
        value: ingredients,
        selector,
        source: "selector",
      };
    }
    if (ldJsonResults.instructions) {
      results.instructions = ldJsonResults.instructions;
    } else {
      const { elements, selector } = trySelectorsAll(
        document,
        selectors.instructions
      );
      let instructions = elements
        .map((el) => extractTextContent(el))
        .filter((t) => t.length > 0)
        .filter(isValidInstruction);
      instructions = removeDuplicates(instructions);
      results.instructions = {
        value: instructions,
        selector,
        source: "selector",
      };
    }
    if (ldJsonResults.prepTime) results.prepTime = ldJsonResults.prepTime;
    if (ldJsonResults.cookTime) results.cookTime = ldJsonResults.cookTime;
    if (ldJsonResults.servings) results.servings = ldJsonResults.servings;
    if (ldJsonResults.image) results.image = ldJsonResults.image;
    if (ldJsonResults.cuisine) results.cuisine = ldJsonResults.cuisine;
  } else {
    // Reader fallback parsing from readable text
    const { title, ingredients, instructions } = parseFromReadableText(html);
    if (title)
      results.title = { value: title, selector: null, source: "selector" };
    if (ingredients.length)
      results.ingredients = {
        value: ingredients,
        selector: null,
        source: "selector",
      };
    if (instructions.length)
      results.instructions = {
        value: instructions,
        selector: null,
        source: "selector",
      };
  }

  const data = {
    title: (results.title.value as string) || "",
    description: (results.description.value as string) || "",
    ingredients: Array.isArray(results.ingredients.value)
      ? results.ingredients.value
      : [results.ingredients.value].filter(Boolean),
    instructions: Array.isArray(results.instructions.value)
      ? results.instructions.value
      : [results.instructions.value].filter(Boolean),
    prepTime: (results.prepTime.value as string) || null,
    cookTime: (results.cookTime.value as string) || null,
    servings: (results.servings.value as string) || null,
    imageUrl: (results.image.value as string) || "",
    cuisine: (results.cuisine.value as string) || "",
    sourceUrl: url,
    nutrition: null as any,
  };

  try {
    const normalized = normalizeIngredients(data.ingredients || [], {
      unitSystem: "imperial",
      amountFormat: "fraction",
      roundToFraction: 0.125,
    });
    data.ingredients = normalized.map((i) => i.display);
  } catch {}

  return { data, results };
}

export async function scrapeRecipeFromHtml(
  html: string,
  url: string,
  customSelectors?: any
): Promise<{ data: any; results: ScrapingResults }> {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const selectors = customSelectors || DEFAULT_SELECTORS;

  const results: ScrapingResults = {
    title: { value: "", selector: null, source: "selector" },
    description: { value: "", selector: null, source: "selector" },
    ingredients: { value: [], selector: null, source: "selector" },
    instructions: { value: [], selector: null, source: "selector" },
    prepTime: { value: "", selector: null, source: "selector" },
    cookTime: { value: "", selector: null, source: "selector" },
    servings: { value: "", selector: null, source: "selector" },
    image: { value: "", selector: null, source: "selector" },
    cuisine: { value: "", selector: null, source: "selector" },
    nutrition: { value: "", selector: null, source: "selector" },
  };

  const ldJsonResults = extractFromLDJSON(document);
  if (ldJsonResults.title) results.title = ldJsonResults.title;
  if (ldJsonResults.description)
    results.description = ldJsonResults.description;
  if (ldJsonResults.ingredients) {
    results.ingredients = ldJsonResults.ingredients;
  } else {
    const { elements, selector } = trySelectorsAll(
      document,
      selectors.ingredients
    );
    let ingredients = elements
      .map((el) => extractTextContent(el))
      .flatMap((text) => text.split(/\r?\n|\u2028|\u2029/))
      .map((t) => t.replace(/^\s*[•·▪▫◦●□▢■☐-]\s*/u, "").trim())
      .filter((text) => text.length > 0)
      .filter(isValidIngredient);
    ingredients = removeDuplicates(ingredients);
    results.ingredients = { value: ingredients, selector, source: "selector" };
  }
  if (ldJsonResults.instructions) {
    results.instructions = ldJsonResults.instructions;
  } else {
    const { elements, selector } = trySelectorsAll(
      document,
      selectors.instructions
    );
    let instructions = elements
      .map((el) => extractTextContent(el))
      .filter((t) => t.length > 0)
      .filter(isValidInstruction);
    instructions = removeDuplicates(instructions);
    results.instructions = {
      value: instructions,
      selector,
      source: "selector",
    };
  }
  if (ldJsonResults.prepTime) results.prepTime = ldJsonResults.prepTime;
  if (ldJsonResults.cookTime) results.cookTime = ldJsonResults.cookTime;
  if (ldJsonResults.servings) results.servings = ldJsonResults.servings;
  if (ldJsonResults.image) results.image = ldJsonResults.image;
  if (ldJsonResults.cuisine) results.cuisine = ldJsonResults.cuisine;

  const data = {
    title: (results.title.value as string) || "",
    description: (results.description.value as string) || "",
    ingredients: Array.isArray(results.ingredients.value)
      ? results.ingredients.value
      : [results.ingredients.value].filter(Boolean),
    instructions: Array.isArray(results.instructions.value)
      ? results.instructions.value
      : [results.instructions.value].filter(Boolean),
    prepTime: (results.prepTime.value as string) || null,
    cookTime: (results.cookTime.value as string) || null,
    servings: (results.servings.value as string) || null,
    imageUrl: (results.image.value as string) || "",
    cuisine: (results.cuisine.value as string) || "",
    sourceUrl: url,
    nutrition: null as any,
  };

  try {
    const normalized = normalizeIngredients(data.ingredients || [], {
      unitSystem: "imperial",
      amountFormat: "fraction",
      roundToFraction: 0.125,
    });
    data.ingredients = normalized.map((i) => i.display);
  } catch {}

  return { data, results };
}
