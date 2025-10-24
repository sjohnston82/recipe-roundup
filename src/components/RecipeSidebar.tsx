import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  SortAscIcon,
  SortDescIcon,
  ClockIcon,
  GlobeIcon,
  TagIcon,
  XIcon,
  PlusIcon,
  ChefHatIcon,
  ShoppingCartIcon,
} from "lucide-react";
import { type FilterOptions } from "./FixedRecipeFilters";
import SearchBar from "./SearchBar";
import { RecipeRecommenderModal } from "./RecipeRecommenderModal";
import { type Recipe } from "../lib/api-hooks";

interface RecipeSidebarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableCuisines: string[];
  availableTags: { tag: string; count: number }[];
  availableIngredients: { ingredient: string; count: number }[];
  recipes: Recipe[];
  onSearch?: (query: string) => void;
  onRecipeSelect?: (recipe: Recipe) => void;
}

export function RecipeSidebar({
  filters,
  onFiltersChange,
  availableCuisines,
  availableTags,
  availableIngredients,
  recipes,
  onSearch,
  onRecipeSelect,
}: RecipeSidebarProps) {
  const updateFilters = (updates: Partial<FilterOptions>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleCuisine = (cuisine: string) => {
    const newCuisines = filters.cuisine.includes(cuisine)
      ? filters.cuisine.filter((c) => c !== cuisine)
      : [...filters.cuisine, cuisine];
    updateFilters({ cuisine: newCuisines });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    updateFilters({ tags: newTags });
  };

  const toggleIngredient = (ingredient: string) => {
    const newIngredients = filters.ingredients.includes(ingredient)
      ? filters.ingredients.filter((i) => i !== ingredient)
      : [...filters.ingredients, ingredient];
    updateFilters({ ingredients: newIngredients });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      sortBy: "recent",
      sortOrder: "desc",
      cuisine: [],
      tags: [],
      ingredients: [],
      maxPrepTime: undefined,
      maxCookTime: undefined,
      minRating: undefined,
    });
  };

  const hasActiveFilters =
    filters.cuisine.length > 0 ||
    filters.tags.length > 0 ||
    filters.ingredients.length > 0 ||
    filters.maxPrepTime !== undefined ||
    filters.maxCookTime !== undefined ||
    filters.minRating !== undefined ||
    filters.sortBy !== "recent" ||
    filters.sortOrder !== "desc";

  const getSortLabel = () => {
    const sortLabels = {
      title: "Title",
      prepTime: "Prep Time",
      cookTime: "Cook Time",
      recent: "Recently Added",
      rating: "Rating",
    };
    return sortLabels[filters.sortBy];
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-80 bg-white border-r border-gray-200 shadow-lg overflow-y-auto z-20">
      <div className="pt-20 p-6 space-y-6">
        {/* Add Recipe Button */}
        <div className="space-y-4">
          <Link to="/add-recipe" className="block">
            <Button className="w-full bg-gradient-to-r from-gradient-dark to-gradient-light hover:opacity-90 transition-opacity text-white font-semibold py-3">
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Recipe
            </Button>
          </Link>

          <Link to="/shopping-lists" className="block">
            <Button className="w-full bg-gradient-to-r from-gradient-dark to-gradient-light hover:opacity-90 transition-opacity text-white font-semibold py-3">
              <ShoppingCartIcon className="w-5 h-5 mr-2" />
              Shopping Lists
            </Button>
          </Link>

          {/* Search Bar */}
          {onSearch && (
            <div className="space-y-2">
              <SearchBar onSearch={onSearch} />
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-center text-gradient-dark">
              Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Sort By</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    {filters.sortOrder === "asc" ? (
                      <SortAscIcon className="w-4 h-4" />
                    ) : (
                      <SortDescIcon className="w-4 h-4" />
                    )}
                    <span>{getSortLabel()}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuItem
                  onClick={() =>
                    updateFilters({ sortBy: "recent", sortOrder: "desc" })
                  }
                >
                  Recently Added
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateFilters({ sortBy: "title", sortOrder: "asc" })
                  }
                >
                  Title (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateFilters({ sortBy: "title", sortOrder: "desc" })
                  }
                >
                  Title (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateFilters({ sortBy: "rating", sortOrder: "desc" })
                  }
                >
                  Rating (Highest)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateFilters({ sortBy: "rating", sortOrder: "asc" })
                  }
                >
                  Rating (Lowest)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    updateFilters({ sortBy: "prepTime", sortOrder: "asc" })
                  }
                >
                  Prep Time (Shortest)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateFilters({ sortBy: "prepTime", sortOrder: "desc" })
                  }
                >
                  Prep Time (Longest)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateFilters({ sortBy: "cookTime", sortOrder: "asc" })
                  }
                >
                  Cook Time (Shortest)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateFilters({ sortBy: "cookTime", sortOrder: "desc" })
                  }
                >
                  Cook Time (Longest)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Cuisine Filter */}
          {availableCuisines.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Cuisine
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <GlobeIcon className="w-4 h-4 text-blue-600" />
                      <span>
                        Cuisine
                        {filters.cuisine.length > 0 && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {filters.cuisine.length}
                          </span>
                        )}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-60 overflow-y-auto w-full">
                  {availableCuisines.map((cuisine) => (
                    <DropdownMenuItem
                      key={cuisine}
                      onClick={() => toggleCuisine(cuisine)}
                      className={
                        filters.cuisine.includes(cuisine)
                          ? "bg-blue-50 text-blue-700"
                          : ""
                      }
                    >
                      {cuisine}
                      {filters.cuisine.includes(cuisine) && (
                        <span className="ml-auto">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tags</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <TagIcon className="w-4 h-4 text-purple-600" />
                      <span>
                        Tags
                        {filters.tags.length > 0 && (
                          <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                            {filters.tags.length}
                          </span>
                        )}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-60 overflow-y-auto w-full">
                  {availableTags.map(({ tag, count }) => (
                    <DropdownMenuItem
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={
                        filters.tags.includes(tag)
                          ? "bg-purple-50 text-purple-700"
                          : ""
                      }
                    >
                      <span className="flex-1">
                        {tag} ({count})
                      </span>
                      {filters.tags.includes(tag) && (
                        <span className="ml-auto">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Ingredients Filter */}
          {availableIngredients.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Ingredients
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <ChefHatIcon className="w-4 h-4 text-green-600" />
                      <span>
                        Ingredients
                        {filters.ingredients.length > 0 && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            {filters.ingredients.length}
                          </span>
                        )}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-60 overflow-y-auto w-full">
                  {availableIngredients.map(({ ingredient, count }) => (
                    <DropdownMenuItem
                      key={ingredient}
                      onClick={() => toggleIngredient(ingredient)}
                      className={
                        filters.ingredients.includes(ingredient)
                          ? "bg-green-50 text-green-700"
                          : ""
                      }
                    >
                      <span className="flex-1">
                        {ingredient} ({count})
                      </span>
                      {filters.ingredients.includes(ingredient) && (
                        <span className="ml-auto">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Time Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Time</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-orange-600" />
                    <span>
                      Time
                      {(filters.maxPrepTime || filters.maxCookTime) && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                          {(filters.maxPrepTime ? 1 : 0) +
                            (filters.maxCookTime ? 1 : 0)}
                        </span>
                      )}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">
                  Prep Time
                </div>
                <DropdownMenuItem
                  onClick={() => updateFilters({ maxPrepTime: undefined })}
                  className={!filters.maxPrepTime ? "bg-gray-50" : ""}
                >
                  Any prep time
                  {!filters.maxPrepTime && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateFilters({ maxPrepTime: 15 })}
                  className={filters.maxPrepTime === 15 ? "bg-gray-50" : ""}
                >
                  15 minutes or less
                  {filters.maxPrepTime === 15 && (
                    <span className="ml-auto">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateFilters({ maxPrepTime: 30 })}
                  className={filters.maxPrepTime === 30 ? "bg-gray-50" : ""}
                >
                  30 minutes or less
                  {filters.maxPrepTime === 30 && (
                    <span className="ml-auto">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateFilters({ maxPrepTime: 60 })}
                  className={filters.maxPrepTime === 60 ? "bg-gray-50" : ""}
                >
                  1 hour or less
                  {filters.maxPrepTime === 60 && (
                    <span className="ml-auto">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">
                  Cook Time
                </div>
                <DropdownMenuItem
                  onClick={() => updateFilters({ maxCookTime: undefined })}
                  className={!filters.maxCookTime ? "bg-gray-50" : ""}
                >
                  Any cook time
                  {!filters.maxCookTime && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateFilters({ maxCookTime: 30 })}
                  className={filters.maxCookTime === 30 ? "bg-gray-50" : ""}
                >
                  30 minutes or less
                  {filters.maxCookTime === 30 && (
                    <span className="ml-auto">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateFilters({ maxCookTime: 60 })}
                  className={filters.maxCookTime === 60 ? "bg-gray-50" : ""}
                >
                  1 hour or less
                  {filters.maxCookTime === 60 && (
                    <span className="ml-auto">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateFilters({ maxCookTime: 120 })}
                  className={filters.maxCookTime === 120 ? "bg-gray-50" : ""}
                >
                  2 hours or less
                  {filters.maxCookTime === 120 && (
                    <span className="ml-auto">✓</span>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Rating</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-600">⭐</span>
                    <span>
                      Rating
                      {filters.minRating && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                          {filters.minRating}+
                        </span>
                      )}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuItem
                  onClick={() => updateFilters({ minRating: undefined })}
                  className={!filters.minRating ? "bg-gray-50" : ""}
                >
                  Any rating
                  {!filters.minRating && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateFilters({ minRating: 4 })}
                  className={filters.minRating === 4 ? "bg-gray-50" : ""}
                >
                  4+ stars
                  {filters.minRating === 4 && (
                    <span className="ml-auto">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateFilters({ minRating: 3 })}
                  className={filters.minRating === 3 ? "bg-gray-50" : ""}
                >
                  3+ stars
                  {filters.minRating === 3 && (
                    <span className="ml-auto">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateFilters({ minRating: 2 })}
                  className={filters.minRating === 2 ? "bg-gray-50" : ""}
                >
                  2+ stars
                  {filters.minRating === 2 && (
                    <span className="ml-auto">✓</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateFilters({ minRating: 1 })}
                  className={filters.minRating === 1 ? "bg-gray-50" : ""}
                >
                  1+ stars
                  {filters.minRating === 1 && (
                    <span className="ml-auto">✓</span>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Active Filters
              </label>
              <div className="flex flex-wrap gap-2">
                {filters.cuisine.map((cuisine) => (
                  <Badge
                    key={`cuisine-${cuisine}`}
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 border-blue-200 cursor-pointer hover:bg-blue-200"
                    onClick={() => toggleCuisine(cuisine)}
                  >
                    {cuisine}
                    <XIcon className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
                {filters.tags.map((tag) => (
                  <Badge
                    key={`tag-${tag}`}
                    variant="secondary"
                    className="bg-purple-100 text-purple-800 border-purple-200 cursor-pointer hover:bg-purple-200"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                    <XIcon className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
                {filters.ingredients.map((ingredient) => (
                  <Badge
                    key={`ingredient-${ingredient}`}
                    variant="secondary"
                    className="bg-green-100 text-green-800 border-green-200 cursor-pointer hover:bg-green-200"
                    onClick={() => toggleIngredient(ingredient)}
                  >
                    {ingredient}
                    <XIcon className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
                {filters.maxPrepTime && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800 border-orange-200 cursor-pointer hover:bg-orange-200"
                    onClick={() => updateFilters({ maxPrepTime: undefined })}
                  >
                    Prep ≤ {filters.maxPrepTime}min
                    <XIcon className="w-3 h-3 ml-1" />
                  </Badge>
                )}
                {filters.maxCookTime && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800 border-orange-200 cursor-pointer hover:bg-orange-200"
                    onClick={() => updateFilters({ maxCookTime: undefined })}
                  >
                    Cook ≤ {filters.maxCookTime}min
                    <XIcon className="w-3 h-3 ml-1" />
                  </Badge>
                )}
                {filters.minRating && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800 border-yellow-200 cursor-pointer hover:bg-yellow-200"
                    onClick={() => updateFilters({ minRating: undefined })}
                  >
                    {filters.minRating}+ stars
                    <XIcon className="w-3 h-3 ml-1" />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recipe Recommender Modal */}
        <RecipeRecommenderModal
          recipes={recipes}
          availableTags={availableTags}
          availableIngredients={availableIngredients}
          onRecipeSelect={onRecipeSelect}
        />
      </div>
    </div>
  );
}
