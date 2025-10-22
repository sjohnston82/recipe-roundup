import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  SparklesIcon,
  Dice1Icon,
  XIcon,
  StarIcon,
  HeartIcon,
} from "lucide-react";
import { StarRating } from "./StarRating";
import { type Recipe } from "../lib/api-hooks";

interface RecipeRecommenderProps {
  recipes: Recipe[];
  availableTags: { tag: string; count: number }[];
  availableIngredients: { ingredient: string; count: number }[];
  onRecipeSelect?: (recipe: Recipe) => void;
  className?: string;
}

export function RecipeRecommender({
  recipes,
  availableTags,
  availableIngredients,
  onRecipeSelect,
  className = "",
}: RecipeRecommenderProps) {
  const [searchInput, setSearchInput] = useState<string>("");
  const [recommendedRecipe, setRecommendedRecipe] = useState<Recipe | null>(null);
  const [isRecommending, setIsRecommending] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);

  const getRandomRecipe = (filteredRecipes: Recipe[]): Recipe | null => {
    if (filteredRecipes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * filteredRecipes.length);
    return filteredRecipes[randomIndex];
  };

  const findMatchingRecipes = () => {
    if (!searchInput.trim()) return [];

    const query = searchInput.toLowerCase().trim();

    return recipes.filter((recipe) => {
      // Match title
      const matchesTitle = recipe.title.toLowerCase().includes(query);
      
      // Match cuisine
      const matchesCuisine = recipe.cuisine?.toLowerCase().includes(query);
      
      // Match tags
      const matchesTags = recipe.tags?.some(tag => 
        tag.toLowerCase().includes(query)
      );
      
      // Match ingredients
      const matchesIngredients = recipe.ingredients.some(ingredient =>
        ingredient.toLowerCase().includes(query)
      );

      return matchesTitle || matchesCuisine || matchesTags || matchesIngredients;
    });
  };

  const handleRecommend = () => {
    if (!searchInput.trim()) return;

    setIsRecommending(true);
    setShowNoResults(false);
    setRecommendedRecipe(null);

    // Add a brief delay for better UX
    setTimeout(() => {
      const matchingRecipes = findMatchingRecipes();
      const randomRecipe = getRandomRecipe(matchingRecipes);

      if (randomRecipe) {
        setRecommendedRecipe(randomRecipe);
      } else {
        setShowNoResults(true);
      }

      setIsRecommending(false);
    }, 800);
  };

  const clearSelections = () => {
    setSearchInput("");
    setRecommendedRecipe(null);
    setShowNoResults(false);
  };

  const clearRecommendation = () => {
    setRecommendedRecipe(null);
    setShowNoResults(false);
  };

  const hasInput = searchInput.trim();

  return (
    <Card className={`p-4 bg-gray-50 border-gray-200 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Recipe Recommender
          </h3>
        </div>

        <p className="text-sm text-gray-600">
          Get a random recipe suggestion based on title, cuisine, tags, or ingredients.
        </p>

        {/* Search Input */}
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Search for recipes
            </label>
            <Input
              type="text"
              placeholder="Enter title, cuisine, tag, or ingredient (e.g., chicken, Italian, dessert)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && hasInput) {
                  handleRecommend();
                }
              }}
              autoFocus={false}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleRecommend}
              disabled={isRecommending || !hasInput}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isRecommending ? (
                <>
                  <SparklesIcon className="w-4 h-4 mr-2 animate-spin" />
                  Finding recipe...
                </>
              ) : (
                <>
                  <Dice1Icon className="w-4 h-4 mr-2" />
                  Get Recommendation
                </>
              )}
            </Button>

            {hasInput && (
              <Button
                onClick={clearSelections}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:bg-gray-50"
              >
                <XIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Active Search Display */}
        {hasInput && (
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 border-blue-200"
            >
              <SparklesIcon className="w-3 h-3 mr-1" />
              {searchInput.trim()}
            </Badge>
          </div>
        )}

        {/* Results Area */}
        {recommendedRecipe && (
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-800">
                Recommended Recipe
              </span>
            </div>

            <Card className="p-0 bg-white border-gray-200 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => onRecipeSelect?.(recommendedRecipe)}>
              <div className="flex">
                {/* Recipe Image */}
                {recommendedRecipe.imageUrl && (
                  <div className="w-20 h-20 flex-shrink-0">
                    <img
                      src={recommendedRecipe.imageUrl}
                      alt={recommendedRecipe.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Recipe Details */}
                <div className="flex-1 p-3 space-y-2">
                  <h4 className="font-semibold text-gray-900 line-clamp-1">
                    {recommendedRecipe.title}
                  </h4>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {recommendedRecipe.rating && recommendedRecipe.rating > 0 ? (
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-3 h-3 ${
                              i < recommendedRecipe.rating!
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <StarRating
                        rating={0}
                        readonly={true}
                        size="sm"
                      />
                    )}
                    {recommendedRecipe.rating && recommendedRecipe.rating > 0 && (
                      <span className="text-xs text-gray-600">
                        {recommendedRecipe.rating}/5
                      </span>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="flex flex-wrap gap-1">
                    {recommendedRecipe.cuisine && (
                      <Badge variant="outline" className="text-xs">
                        {recommendedRecipe.cuisine}
                      </Badge>
                    )}
                    {recommendedRecipe.prepTime && (
                      <Badge variant="outline" className="text-xs">
                        {recommendedRecipe.prepTime}min prep
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-2">
              <Button
                onClick={handleRecommend}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Dice1Icon className="w-4 h-4 mr-1" />
                Try Again
              </Button>
              <Button
                onClick={clearRecommendation}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:bg-gray-50"
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* No Results */}
        {showNoResults && (
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                No recipes found matching your search. Try different keywords or add more recipes to your collection.
              </p>
              <Button
                onClick={clearSelections}
                variant="outline"
                size="sm"
              >
                Clear Search
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
