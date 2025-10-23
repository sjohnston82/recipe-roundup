import { createAPIFileRoute } from "@tanstack/react-start/api";
import { prisma } from "../server/db/prisma";
import { z } from "zod";
import {
  DEFAULT_SELECTORS,
  scrapeRecipe,
  scrapeRecipeFromHtml,
  type ScrapingResults,
} from "../server/scrape-helpers";
import {
  getCustomSelectorsForDomain,
  saveSuccessfulSelectors,
} from "../server/services/domainSelectorsService";

const scrapeRequestSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  html: z.string().optional(), // allow raw HTML upload as a last-resort fallback
});

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    throw new Error("Invalid URL");
  }
}

export const APIRoute = createAPIFileRoute("/api/scrape-recipe")({
  POST: async ({ request }: { request: Request }) => {
    try {
      const body = await request.json();
      const { url, html } = scrapeRequestSchema.parse(body);

      const domain = extractDomain(url);

      // Check if we have custom selectors for this domain
      const ds = await getCustomSelectorsForDomain(domain);
      const customSelectors: any = ds
        ? {
            title: ds.title ?? DEFAULT_SELECTORS.title,
            description: ds.description ?? DEFAULT_SELECTORS.description,
            ingredients: ds.ingredients ?? DEFAULT_SELECTORS.ingredients,
            instructions: ds.instructions ?? DEFAULT_SELECTORS.instructions,
            prepTime: ds.prepTime ?? DEFAULT_SELECTORS.prepTime,
            cookTime: ds.cookTime ?? DEFAULT_SELECTORS.cookTime,
            servings: ds.servings ?? DEFAULT_SELECTORS.servings,
            image: ds.image ?? DEFAULT_SELECTORS.image,
            cuisine: ds.cuisine ?? DEFAULT_SELECTORS.cuisine,
          }
        : null;

      const { data: recipeData, results } = html
        ? await scrapeRecipeFromHtml(html, url, customSelectors)
        : await scrapeRecipe(url, customSelectors);

      // Auto-save successful selectors if we didn't use custom selectors
      if (!ds) {
        // Save any successful selector-based extractions for this domain
        const selectorsToSave: any = {};
        if (results.title.selector && results.title.source === "selector")
          selectorsToSave.titleSelector = results.title.selector;
        if (
          results.description.selector &&
          results.description.source === "selector"
        )
          selectorsToSave.descriptionSelector = results.description.selector;
        if (
          Array.isArray(results.ingredients.value) &&
          results.ingredients.value.length > 0 &&
          results.ingredients.selector &&
          results.ingredients.source === "selector"
        )
          selectorsToSave.ingredientsSelector = results.ingredients.selector;
        if (
          Array.isArray(results.instructions.value) &&
          results.instructions.value.length > 0 &&
          results.instructions.selector &&
          results.instructions.source === "selector"
        )
          selectorsToSave.instructionsSelector = results.instructions.selector;
        if (results.prepTime.selector && results.prepTime.source === "selector")
          selectorsToSave.prepTimeSelector = results.prepTime.selector;
        if (results.cookTime.selector && results.cookTime.source === "selector")
          selectorsToSave.cookTimeSelector = results.cookTime.selector;
        if (results.servings.selector && results.servings.source === "selector")
          selectorsToSave.servingsSelector = results.servings.selector;
        if (results.image.selector && results.image.source === "selector")
          selectorsToSave.imageSelector = results.image.selector;
        if (results.cuisine.selector && results.cuisine.source === "selector")
          selectorsToSave.cuisineSelector = results.cuisine.selector;

        if (Object.keys(selectorsToSave).length > 0) {
          await saveSuccessfulSelectors(domain, selectorsToSave);
        }
      }

      // Count successful extractions
      const successfulExtractions = Object.values(results).filter((result) => {
        if (Array.isArray(result.value)) return result.value.length > 0;
        return result.value !== "";
      }).length;

      const ldJsonExtractions = Object.values(results).filter(
        (result) => result.source === "ld-json"
      ).length;

      return Response.json({
        success: true,
        data: recipeData,
        usedCustomSelectors: !!ds,
        extractionStats: {
          total: Object.keys(results).length,
          successful: successfulExtractions,
          fromLdJson: ldJsonExtractions,
          fromSelectors: successfulExtractions - ldJsonExtractions,
        },
        extractionDetails: results,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Response.json(
          {
            success: false,
            error: "Invalid URL provided",
            details: error.errors,
          },
          { status: 400 }
        );
      }
      return Response.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to scrape recipe",
        },
        { status: 500 }
      );
    }
  },
});
