import { useState } from "react";
import { Button } from "./ui/button";
import { SparklesIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { RecipeRecommender } from "./RecipeRecommender";
import { type Recipe } from "../lib/api-hooks";

interface MobileRecipeRecommenderProps {
  recipes: Recipe[];
  availableTags: { tag: string; count: number }[];
  availableIngredients: { ingredient: string; count: number }[];
  onRecipeSelect?: (recipe: Recipe) => void;
}

export function MobileRecipeRecommender({
  recipes,
  availableTags,
  availableIngredients,
  onRecipeSelect,
}: MobileRecipeRecommenderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full">
      {/* Toggle Button */}
      <Button
        onClick={toggleExpanded}
        variant="outline"
        className="w-full mb-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200 text-blue-700 font-medium"
      >
        <SparklesIcon className="w-4 h-4 mr-2" />
        Recipe Recommender
        {isExpanded ? (
          <ChevronUpIcon className="w-4 h-4 ml-auto" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 ml-auto" />
        )}
      </Button>

      {/* Animated Container */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="transform transition-transform duration-300 ease-in-out">
          <RecipeRecommender
            recipes={recipes}
            availableTags={availableTags}
            availableIngredients={availableIngredients}
            onRecipeSelect={onRecipeSelect}
            className="mb-4"
          />
        </div>
      </div>
    </div>
  );
}
