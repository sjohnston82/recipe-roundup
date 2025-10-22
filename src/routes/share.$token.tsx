import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ClockIcon,
  UsersIcon,
  GlobeIcon,
  ChevronsUpDown,
  ArrowLeftIcon,
} from "lucide-react";
import { NutritionInfo } from "@/components/NutritionInfo";
import { scaleServings } from "../lib/ingredient-scaling";
import { RecipeIngredients } from "../components/shared/RecipeIngredients";
import { getTagColor } from "../lib/tag-colors";
import { useState } from "react";

export const Route = createFileRoute("/share/$token" as any)({
  component: SharedRecipePage,
  loader: async ({ params }: any) => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/share-recipe?token=${params.token}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to load shared recipe");
      }
      
      return data.recipe;
    } catch (error) {
      console.error('Error loading shared recipe:', error);
      throw new Error("Failed to load shared recipe");
    }
  },
});

function SharedRecipePage() {
  const recipe = Route.useLoaderData() as any;
  const [isShowingIngredients, setIsShowingIngredients] = useState(true);
  const [isShowingInstructions, setIsShowingInstructions] = useState(true);
  const [isShowingNutrition, setIsShowingNutrition] = useState(false);
  const [ingredientScale, setIngredientScale] = useState(1);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  const toggleIngredientCheck = (index: number) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (!recipe) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-text mb-4">Shared recipe not found</p>
          <Link to="/">
            <Button>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Go to RecipeRoundup
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-muted-text mb-4">
            This recipe is brought to you by{" "}
            <Link to="/" className="text-gradient-light hover:text-gradient-dark font-semibold">
              RecipeRoundup
            </Link>
          </p>
        </div>

        {/* Recipe Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gradient-dark text-center">
            {recipe.title}
          </h1>
        </div>

        {/* Rest of the content - same structure as recipe page but without user-specific features */}
        <div className="space-y-6">
          {/* Recipe Image */}
          <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">🍽️</div>
                <p className="text-lg font-medium">No Image Available</p>
              </div>
            )}
          </div>

          {/* Description */}
          {recipe.description && (
            <div>
              <h2 className="text-lg font-semibold text-gradient-dark mb-2">
                Description
              </h2>
              <p className="text-muted-text">{recipe.description}</p>
            </div>
          )}

          {/* Recipe Meta Info */}
          <div className="flex flex-col gap-2 mb-3">
            <div className="bg-[#eff6ff] flex justify-between rounded-xl p-3 w-full">
              <p className="text-[#88a3eb] font-semibold text-lg">🍽️ Cuisine</p>
              <p className="italic font-semibold text-lg">
                {recipe.cuisine || "No info"}
              </p>
            </div>

            <div className="bg-[#f0fdf4] flex justify-between rounded-xl p-3 w-full">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ClockIcon className="w-4 h-4 text-[#15803d]" />
                <p className="text-[#15803d] font-semibold text-lg">Prep</p>
              </div>
              <p className="font-semibold text-lg italic">
                {recipe.prepTime ? recipe.prepTime + " minutes" : "No info"}
              </p>
            </div>

            <div className="bg-[#fefce8] flex justify-between rounded-xl p-3 w-full">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ClockIcon className="w-4 h-4 text-[#15803d]" />
                <p className="text-[#a16206] font-semibold text-lg">Cook Time</p>
              </div>
              <p className="font-semibold text-lg italic">
                {recipe.cookTime ? recipe.cookTime + " minutes" : "No info"}
              </p>
            </div>

            <div className="flex justify-between bg-[#faf5ff] rounded-xl p-3">
              <div className="flex items-center justify-center gap-1 mb-1">
                <UsersIcon className="w-4 h-4 text-[#7e22ce]" />
                <p className="text-[#7e22ce] font-semibold text-lg">Servings</p>
              </div>
              <p className="italic font-semibold text-lg">
                {scaleServings(recipe.servings, ingredientScale) || "No info"}
              </p>
            </div>
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gradient-dark mb-2">
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={`${getTagColor(
                      index
                    )} hover:opacity-80 transition-opacity`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Ingredients */}
          <RecipeIngredients
            currentRecipe={recipe}
            isEditing={false}
            isShowingIngredients={isShowingIngredients}
            setIsShowingIngredients={setIsShowingIngredients}
            ingredientScale={ingredientScale}
            setIngredientScale={setIngredientScale}
            checkedIngredients={checkedIngredients}
            toggleIngredientCheck={toggleIngredientCheck}
            handleArrayChange={() => {}}
            addArrayItem={() => {}}
            removeArrayItem={() => {}}
          />

          {/* Instructions */}
          <Collapsible
            open={isShowingInstructions}
            onOpenChange={setIsShowingInstructions}
            className="flex flex-col gap-2"
          >
            <div>
              <div className="flex justify-between">
                <h2 className="text-lg font-semibold text-gradient-dark flex items-center">
                  <span className="w-2 h-2 bg-accent-peach rounded-full mr-2"></span>
                  Instructions ({recipe.instructions.length} steps)
                </h2>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 cursor-pointer"
                  >
                    <ChevronsUpDown />
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="flex flex-col gap-2">
                <ol className="space-y-3 mt-2">
                  {recipe.instructions.map((instruction: string, index: number) => (
                    <li
                      key={index}
                      className="text-muted-text flex items-start"
                    >
                      <span className="bg-gradient-dark text-white text-sm rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      {instruction}
                    </li>
                  ))}
                </ol>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Nutrition */}
          {recipe.nutrition && (
            <Collapsible
              open={isShowingNutrition}
              onOpenChange={setIsShowingNutrition}
              className="flex flex-col gap-2"
            >
              <div>
                <div className="flex justify-between">
                  <h2 className="text-lg font-semibold text-gradient-dark flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    Nutrition Information
                  </h2>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 cursor-pointer"
                    >
                      <ChevronsUpDown />
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="flex flex-col gap-2">
                  <NutritionInfo
                    nutrition={recipe.nutrition}
                    isEditing={false}
                  />
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          {/* Source URL */}
          {recipe.sourceUrl && (
            <div className="pt-4 border-t border-gray-100">
              <h2 className="text-lg font-semibold text-gradient-dark mb-2">
                Source
              </h2>
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gradient-light hover:text-gradient-dark transition-colors inline-flex items-center"
              >
                <GlobeIcon className="w-4 h-4 mr-2" />
                View Original Recipe
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
