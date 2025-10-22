import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Clean ingredient text by removing checkbox artifacts and other unwanted characters
function cleanIngredient(ingredient: string): string {
  return (
    ingredient
      // Remove checkbox characters (☐, ☑, ✓, ✔, etc.)
      .replace(/[\u2610\u2611\u2612\u2713\u2714\u2715\u2716\u2717\u2718]/g, "")
      // Remove checkbox HTML entities
      .replace(/&\#?\w+;/g, "")
      // Remove "1x2x3x" patterns (serving multipliers)
      .replace(/1x2x3x/g, "")
      // Remove multiple whitespace with single space
      .replace(/\s+/g, " ")
      // Remove various unicode spaces
      .replace(/[\u00A0\u2000-\u200B\u2028\u2029]/g, " ")
      // Remove newlines
      .replace(/\n+/g, " ")
      .trim()
  );
}

function cleanIngredientsArray(ingredients: string[]): string[] {
  return ingredients.map(cleanIngredient).filter((ing) => ing.length > 0);
}

async function main() {
  console.log("Starting to clean recipe ingredients...");

  try {
    // Get all recipes
    const recipes = await prisma.recipe.findMany({
      select: {
        id: true,
        title: true,
        ingredients: true,
      },
    });

    console.log(`Found ${recipes.length} recipes to process`);

    let updatedCount = 0;
    let errorCount = 0;
    let unchangedCount = 0;

    // Process each recipe
    for (const recipe of recipes) {
      try {
        const cleanedIngredients = cleanIngredientsArray(recipe.ingredients);

        // Only update if ingredients changed
        const hasChanges =
          JSON.stringify(recipe.ingredients) !==
          JSON.stringify(cleanedIngredients);

        if (hasChanges) {
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: { ingredients: cleanedIngredients },
          });
          console.log(`✓ Cleaned ingredients for: ${recipe.title}`);
          updatedCount++;
        } else {
          unchangedCount++;
        }
      } catch (error) {
        console.error(
          `✗ Error cleaning recipe ${recipe.id} (${recipe.title}):`,
          error
        );
        errorCount++;
      }
    }

    console.log("\n=== Summary ===");
    console.log(`Total recipes: ${recipes.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Unchanged: ${unchangedCount}`);
    console.log(`Errors: ${errorCount}`);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
