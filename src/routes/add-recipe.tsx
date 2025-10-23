import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import toast from "react-hot-toast";
import { useCreateRecipe, type CreateRecipeData } from "../lib/api-hooks";
import { TagInput } from "@/components/TagsInput";
import { useSession } from "@/lib/auth-client";
import { normalizeIngredients } from "@/lib/ingredients";
import { NutritionInfo } from "../components/NutritionInfo";

export const Route = createFileRoute("/add-recipe")({
  component: AddRecipePage,
});

// Zod schema for recipe validation
const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  sourceUrl: z.string().url("Must be a valid URL"),
  cuisine: z.string().optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  servings: z.string().optional(),
  ingredients: z.array(z.string().optional()),
  instructions: z.array(z.string().optional()),
  tags: z.array(z.string().optional()),
  imageUrl: z.string().optional(),
  nutrition: z
    .object({
      calories: z.string().optional(),
      protein: z.string().optional(),
      totalFat: z.string().optional(),
      saturatedFat: z.string().optional(),
      transFat: z.string().optional(),
      fiber: z.string().optional(),
      sugar: z.string().optional(),
      sodium: z.string().optional(),
    })
    .optional(),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

export default function AddRecipePage() {
  const navigate = useNavigate();
  const { data: session, isPending: sessionLoading } = useSession();
  const [isPrefillMode, setIsPrefillMode] = React.useState(true);
  const [prefilledOnce, setPrefilledOnce] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [urlInput, setUrlInput] = React.useState("");
  

  const createRecipeMutation = useCreateRecipe();

  // Redirect to unauthorized page if not authenticated
  React.useEffect(() => {
    if (!sessionLoading && !session) {
      window.location.href = "/unauthorized";
    }
  }, [session, sessionLoading]);

  const resolver = zodResolver(recipeSchema);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver,
    defaultValues: {
      ingredients: [],
      instructions: [],
      tags: [],
    },
  });

  const ingredients = watch("ingredients");
  const instructions = watch("instructions");
  const tags = watch("tags");
  const nutrition = watch("nutrition");

  // Show loading while checking authentication
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gradient-dark"></div>
          <p className="mt-2 text-muted-text">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the form if not authenticated
  if (!session) {
    return null;
  }

  const addIngredient = () => {
    setValue("ingredients", [...ingredients, ""]);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setValue("ingredients", newIngredients);
  };

  const addInstruction = () => {
    setValue("instructions", [...instructions, ""]);
  };

  const removeInstruction = (index: number) => {
    const newInstructions = instructions.filter((_, i) => i !== index);
    setValue("instructions", newInstructions);
  };

  const handleUrlScrape = async () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/scrape-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: urlInput }),
      });

      const result = await response.json();

      if (result.success) {
        const scrapedData = result.data;

        // Populate form with scraped data
        setValue("title", scrapedData.title || "");
        setValue("description", scrapedData.description || "");
        setValue("sourceUrl", scrapedData.sourceUrl || urlInput);
        setValue("cuisine", scrapedData.cuisine || "");
        setValue("prepTime", scrapedData.prepTime || "");
        setValue("cookTime", scrapedData.cookTime || "");
        setValue("servings", scrapedData.servings || "");
        const scrapedIngredients = Array.isArray(scrapedData.ingredients)
          ? scrapedData.ingredients
          : [];
        const ingSorted = [...scrapedIngredients].sort(
          (a: string, b: string) => {
            const ae = !a || a.trim() === "";
            const be = !b || b.trim() === "";
            return ae === be ? 0 : ae ? 1 : -1;
          }
        );
        setValue("ingredients", ingSorted.length > 0 ? ingSorted : [""]);

        const scrapedInstructions = Array.isArray(scrapedData.instructions)
          ? scrapedData.instructions
          : [];
        const instSorted = [...scrapedInstructions].sort(
          (a: string, b: string) => {
            const ae = !a || a.trim() === "";
            const be = !b || b.trim() === "";
            return ae === be ? 0 : ae ? 1 : -1;
          }
        );
        setValue("instructions", instSorted.length > 0 ? instSorted : [""]);
        setValue("imageUrl", scrapedData.imageUrl || "");
        setValue("tags", []);
        setValue("nutrition", scrapedData.nutrition || {});
        setPrefilledOnce(true);

        let successMessage = result.usedCustomSelectors
          ? "Recipe data scraped successfully using saved selectors!"
          : "Recipe data scraped successfully using default selectors!";
        // Show detailed success message
        const stats = result.extractionStats;
        if (stats) {
          successMessage = `Recipe data scraped successfully!`;
          if (stats.fromLdJson > 0) {
            successMessage += `${stats.fromLdJson} from LD-JSON metadata, `;
          }
          if (stats.fromSelectors > 0) {
            successMessage += `${stats.fromSelectors} from CSS selectors. `;
          }
          if (!result.usedCustomSelectors && stats.fromSelectors > 0) {
            successMessage += `Successful selectors saved for future use!`;
          }
        }

        toast.success(successMessage);
      } else {
        toast.error(result.error || "Failed to scrape recipe data");
      }
    } catch (error) {
      console.error("Scraping error:", error);
      toast.error(
        "Failed to scrape recipe data. Please try again or fill manually."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNutritionChange = (nutritionData: any) => {
    setValue("nutrition", nutritionData);
  };

  const onSubmit = (data: RecipeFormData) => {
    const tags = data.tags
      ? data.tags
          .filter((t): t is string => !!t && t.trim() !== "")
          .map((t) => t.trim())
      : [];
    const instructions = data.instructions
      ? data.instructions
          .filter((t): t is string => !!t && t.trim() !== "")
          .map((t) => t.trim())
      : [];
    const ingredientsRaw = data.ingredients
      ? data.ingredients
          .filter((t): t is string => !!t && t.trim() !== "")
          .map((t) => t.trim())
      : [];
    // Normalize ingredients before submit
    const normalized = normalizeIngredients(ingredientsRaw, {
      unitSystem: "imperial",
      amountFormat: "fraction",
      roundToFraction: 0.125,
    });
    const ingredients = normalized.map((i) => i.display);
    const recipeData: CreateRecipeData = {
      ...data,
      ingredients: ingredients,
      instructions: instructions,
      description: data.description || null,
      cuisine: data.cuisine || null,
      prepTime: data.prepTime || null,
      cookTime: data.cookTime || null,
      servings: data.servings || null,
      tags: tags,
      imageUrl: data.imageUrl || null,
      nutrition:
        data.nutrition && Object.values(data.nutrition).some((v) => v?.trim())
          ? data.nutrition
          : null,
    };

    createRecipeMutation.mutate(recipeData, {
      onSuccess: () => {
        navigate({ to: "/" });
      },
    });
  };

  const filteredTags = tags.filter((t): t is string => !!t && t.trim() !== "");

  // Helpers to determine missing fields for subtle highlighting and ordering
  const isMissing = (val: unknown) =>
    val === undefined ||
    val === null ||
    (typeof val === "string" && val.trim() === "");
  const highlightIfMissing = (val: unknown) =>
    prefilledOnce && isMissing(val)
      ? "ring-1 ring-sky-300 border-sky-300 bg-sky-50 glow-attn rounded-md"
      : "";

  return (
    <div className="min-h-screen bg-bg-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-gradient-dark to-gradient-light p-6 text-black">
            <h2 className="text-3xl font-bold text-white text-center">
              Add New Recipe
            </h2>
            <p className="text-center text-white mt-2">
              Share your culinary creations with beautiful images
            </p>
          </div>

          <div className="p-8">
            {/* Centered large toggle between Prefill and Manual */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-full border border-gray-300 bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsPrefillMode(true)}
                  className={`px-6 py-3 text-base font-medium transition-colors ${
                    isPrefillMode
                      ? "bg-gradient-to-r from-gradient-dark to-gradient-light text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  aria-pressed={isPrefillMode}
                >
                  Prefill
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrefillMode(false)}
                  className={`px-6 py-3 text-base font-medium transition-colors ${
                    !isPrefillMode
                      ? "bg-gradient-to-r from-gradient-dark to-gradient-light text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  aria-pressed={!isPrefillMode}
                >
                  Manual
                </button>
              </div>
            </div>

            {/* URL input for prefill mode */}
            {isPrefillMode && (
              <div className="mb-8 p-6 bg-bg-light rounded-lg border">
                <Label
                  htmlFor="url-input"
                  className="block text-sm font-medium text-muted-text mb-3"
                >
                  Recipe URL
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="url-input"
                    type="url"
                    placeholder="Enter recipe URL"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleUrlScrape}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-gradient-dark to-gradient-light hover:opacity-90"
                  >
                    {isLoading ? "Getting..." : "Get Recipe Info"}
                  </Button>
                </div>
              </div>
            )}

            {/* Recipe form or loading area */}
            {(!isPrefillMode || prefilledOnce) ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-4">
                <Label className="block text-lg font-semibold text-gradient-dark">
                  Recipe Image
                </Label>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="image-url"
                      className="block text-sm font-medium text-muted-text mb-2"
                    >
                      Image URL
                    </Label>
                    <Input
                      id="image-url"
                      type="url"
                      {...register("imageUrl")}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <Label className="block text-lg font-semibold text-gradient-dark">
                  Basic Information
                </Label>

                <div>
                  <Label
                    htmlFor="title"
                    className="block text-sm font-medium text-muted-text mb-2"
                  >
                    Recipe Title *
                  </Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="Enter recipe title"
                    className="w-full"
                  />
                  {errors.title && (
                    <span className="text-sm text-danger mt-1 block">
                      {errors.title.message}
                    </span>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="description"
                    className="block text-sm font-medium text-muted-text mb-2"
                  >
                    Description
                  </Label>
                  <textarea
                    id="description"
                    {...register("description")}
                    placeholder="Enter recipe description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none min-h-[100px] focus:ring-2 focus:ring-gradient-light focus:border-transparent"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="sourceUrl"
                    className="block text-sm font-medium text-muted-text mb-2"
                  >
                    Source URL *
                  </Label>
                  <Input
                    id="sourceUrl"
                    type="url"
                    {...register("sourceUrl")}
                    placeholder="Enter source URL"
                    className="w-full"
                  />
                  {errors.sourceUrl && (
                    <span className="text-sm text-danger mt-1 block">
                      {errors.sourceUrl.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Tags moved below Nutrition */}

              {/* Recipe Details */}
              <div className="space-y-4">
                <Label className="block text-lg font-semibold text-gradient-dark">
                  Recipe Details
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="cuisine"
                      className="block text-sm font-medium text-muted-text mb-2"
                    >
                      Cuisine
                    </Label>
                    <Input
                      id="cuisine"
                      {...register("cuisine")}
                      placeholder="e.g., Italian, Mexican"
                      className={`w-full ${highlightIfMissing(
                        watch("cuisine")
                      )}`}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="servings"
                      className="block text-sm font-medium text-muted-text mb-2"
                    >
                      Servings
                    </Label>
                    <Input
                      id="servings"
                      type="text"
                      {...register("servings")}
                      placeholder="4"
                      className={`w-full ${highlightIfMissing(
                        watch("servings")
                      )}`}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="prepTime"
                      className="block text-sm font-medium text-muted-text mb-2"
                    >
                      Prep Time (minutes)
                    </Label>
                    <Input
                      id="prepTime"
                      type="text"
                      {...register("prepTime")}
                      placeholder="15"
                      className={`w-full ${highlightIfMissing(
                        watch("prepTime")
                      )}`}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="cookTime"
                      className="block text-sm font-medium text-muted-text mb-2"
                    >
                      Cook Time (minutes)
                    </Label>
                    <Input
                      id="cookTime"
                      type="text"
                      {...register("cookTime")}
                      placeholder="30"
                      className={`w-full ${highlightIfMissing(
                        watch("cookTime")
                      )}`}
                    />
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="space-y-4">
                <Label className="block text-lg font-semibold text-gradient-dark">
                  Ingredients
                </Label>
                <div className="space-y-3">
                  {ingredients.map((_, index) => (
                    <div key={index} className="flex gap-3">
                      <Input
                        {...register(`ingredients.${index}`)}
                        placeholder={`Ingredient ${index + 1}`}
                        className={`flex-1 ${highlightIfMissing(
                          watch(`ingredients.${index}`)
                        )}`}
                      />
                      {ingredients.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="bg-danger-red hover:bg-red-600 px-4"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={addIngredient}
                    className="bg-success-green hover:bg-green-600 w-fit"
                  >
                    Add Ingredient
                  </Button>
                  {errors.ingredients && (
                    <span className="text-sm text-danger block">
                      {errors.ingredients.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <Label className="block text-lg font-semibold text-gradient-dark">
                  Instructions
                </Label>
                <div className="space-y-3">
                  {instructions.map((_, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-1">
                        <Label className="block text-sm font-medium text-muted-text mb-1">
                          Step {index + 1}
                        </Label>
                        <textarea
                          {...register(`instructions.${index}`)}
                          placeholder={`Describe step ${index + 1}`}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md outline-none min-h-[80px] focus:ring-2 focus:ring-gradient-light focus:border-transparent ${highlightIfMissing(
                            watch(`instructions.${index}`)
                          )}`}
                        />
                      </div>
                      {instructions.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeInstruction(index)}
                          className="bg-danger hover:bg-red-600 px-4 h-fit mt-6"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={addInstruction}
                    className="bg-success-green hover:bg-green-600 w-fit"
                  >
                    Add Instruction
                  </Button>
                  {errors.instructions && (
                    <span className="text-sm text-danger block">
                      {errors.instructions.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="block text-lg font-semibold text-gradient-dark">
                  Nutrition Information
                </Label>
                <NutritionInfo
                  nutrition={nutrition || null}
                  isEditing={true}
                  onNutritionChange={handleNutritionChange}
                />
              </div>

              {/* Tags - moved below Nutrition, with subtle emphasis */}
              <div className="space-y-3 p-4 rounded-md border border-sky-200 bg-sky-50/60">
                <Label className="block text-lg font-semibold text-sky-800">
                  Tags
                </Label>
                <TagInput
                  tags={filteredTags}
                  onChange={(updatedTags) => {
                    setValue("tags", updatedTags);
                  }}
                />
              </div>

              {/* Submit buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="button"
                  onClick={() => navigate({ to: "/" })}
                  variant="outline"
                  className="flex-1 border-muted-text text-muted-text hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createRecipeMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-gradient-dark to-gradient-light hover:opacity-90 text-lg py-3"
                >
                  {createRecipeMutation.isPending ? "Saving..." : "Save Recipe"}
                </Button>
              </div>
            </form>
            ) : (
              isPrefillMode && isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gradient-dark"></div>
                    <p className="mt-2 text-muted-text">Getting recipe info...</p>
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>

      {/* Advanced options removed for now */}
    </div>
  );
}
