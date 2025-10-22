
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
  FilterIcon,
  ChevronDownIcon,
  ChefHatIcon,
} from "lucide-react";
import { MobileRecipeRecommender } from "./MobileRecipeRecommender";
import { type Recipe } from "../lib/api-hooks";

export interface FilterOptions {
  sortBy: "title" | "prepTime" | "cookTime" | "recent" | "rating";
  sortOrder: "asc" | "desc";
  cuisine: string[];
  tags: string[];
  ingredients: string[];
  maxPrepTime?: number;
  maxCookTime?: number;
  minRating?: number;
}

interface FixedRecipeFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableCuisines: string[];
  availableTags: { tag: string; count: number }[];
  availableIngredients: { ingredient: string; count: number }[];
  recipes: Recipe[];
  onRecipeSelect?: (recipe: Recipe) => void;
}

export function FixedRecipeFilters({
  filters,
  onFiltersChange,
  availableCuisines,
  availableTags,
  availableIngredients,
  recipes,
  onRecipeSelect,
}: FixedRecipeFiltersProps) {
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
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Mobile: Compact filter interface */}
        <div className="sm:hidden">
          {/* Main filter row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Filter button with count */}
            <div className="flex items-center gap-2">
              <FilterIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                    {(filters.cuisine.length > 0 ? 1 : 0) +
                     (filters.tags.length > 0 ? 1 : 0) +
                     (filters.maxPrepTime ? 1 : 0) +
                     (filters.maxCookTime ? 1 : 0) +
                     (filters.minRating ? 1 : 0)}
                  </span>
                )}
              </span>
            </div>

            {/* Sort dropdown - compact */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-md cursor-pointer transition-colors">
                  {filters.sortOrder === "asc" ? (
                    <SortAscIcon className="w-3 h-3" />
                  ) : (
                    <SortDescIcon className="w-3 h-3" />
                  )}
                  <span className="text-xs font-medium">Sort</span>
                  <ChevronDownIcon className="w-3 h-3" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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

          {/* Filter options grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Cuisine Filter */}
            {availableCuisines.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <GlobeIcon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Cuisine</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {filters.cuisine.length > 0 && (
                        <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full">
                          {filters.cuisine.length}
                        </span>
                      )}
                      <ChevronDownIcon className="w-3 h-3 text-blue-600" />
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-60 overflow-y-auto w-48">
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
            )}

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-purple-50 hover:bg-purple-100 rounded-lg cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <TagIcon className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">Tags</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {filters.tags.length > 0 && (
                        <span className="text-xs bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full">
                          {filters.tags.length}
                        </span>
                      )}
                      <ChevronDownIcon className="w-3 h-3 text-purple-600" />
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-60 overflow-y-auto w-48">
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
                      <span className="flex-1">{tag} ({count})</span>
                      {filters.tags.includes(tag) && (
                        <span className="ml-auto">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Ingredients Filter */}
            {availableIngredients.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-green-50 hover:bg-green-100 rounded-lg cursor-pointer transition-colors">
                    <div className="flex items-center gap-2">
                      <ChefHatIcon className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Ingredients</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {filters.ingredients.length > 0 && (
                        <span className="text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full">
                          {filters.ingredients.length}
                        </span>
                      )}
                      <ChevronDownIcon className="w-3 h-3 text-green-600" />
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-60 overflow-y-auto w-48">
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
                      <span className="flex-1">{ingredient} ({count})</span>
                      {filters.ingredients.includes(ingredient) && (
                        <span className="ml-auto">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Time Filters */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-orange-50 hover:bg-orange-100 rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Time</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(filters.maxPrepTime || filters.maxCookTime) && (
                      <span className="text-xs bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded-full">
                        {(filters.maxPrepTime ? 1 : 0) + (filters.maxCookTime ? 1 : 0)}
                      </span>
                    )}
                    <ChevronDownIcon className="w-3 h-3 text-orange-600" />
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
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

            {/* Rating Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-yellow-50 hover:bg-yellow-100 rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-600">⭐</span>
                    <span className="text-sm font-medium text-yellow-700">Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {filters.minRating && (
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full">
                        {filters.minRating}+
                      </span>
                    )}
                    <ChevronDownIcon className="w-3 h-3 text-yellow-600" />
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
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
                  {filters.minRating === 4 && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateFilters({ minRating: 3 })}
                  className={filters.minRating === 3 ? "bg-gray-50" : ""}
                >
                  3+ stars
                  {filters.minRating === 3 && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateFilters({ minRating: 2 })}
                  className={filters.minRating === 2 ? "bg-gray-50" : ""}
                >
                  2+ stars
                  {filters.minRating === 2 && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateFilters({ minRating: 1 })}
                  className={filters.minRating === 1 ? "bg-gray-50" : ""}
                >
                  1+ stars
                  {filters.minRating === 1 && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Clear All Button */}
          {hasActiveFilters && (
            <div className="flex justify-center mt-3">
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
              >
                <XIcon className="w-4 h-4" />
                Clear All Filters
              </button>
            </div>
          )}

          {/* Recipe Recommender - Mobile only */}
          <div className="mt-4">
            <MobileRecipeRecommender
              recipes={recipes}
              availableTags={availableTags}
              availableIngredients={availableIngredients}
              onRecipeSelect={onRecipeSelect}
            />
          </div>
        </div>

        {/* Tablet/Desktop: Original flex-wrap layout */}
        <div className="hidden sm:flex xl:hidden flex-wrap items-center gap-3">
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                {filters.sortOrder === "asc" ? (
                  <SortAscIcon className="w-4 h-4" />
                ) : (
                  <SortDescIcon className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{getSortLabel()}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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

          {/* Cuisine Filter */}
          {availableCuisines.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors">
                  <GlobeIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    Cuisine
                    {filters.cuisine.length > 0 && (
                      <span className="ml-1 text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full">
                        {filters.cuisine.length}
                      </span>
                    )}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-60 overflow-y-auto">
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
          )}

       

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg cursor-pointer transition-colors">
                  <TagIcon className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">
                    Tags
                    {filters.tags.length > 0 && (
                      <span className="ml-1 text-xs bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full">
                        {filters.tags.length}
                      </span>
                    )}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-60 overflow-y-auto">
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
                    <span className="flex-1">{tag} ({count})</span>
                    {filters.tags.includes(tag) && (
                      <span className="ml-auto">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Ingredients Filter */}
          {availableIngredients.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg cursor-pointer transition-colors">
                  <ChefHatIcon className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Ingredients
                    {filters.ingredients.length > 0 && (
                      <span className="ml-1 text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full">
                        {filters.ingredients.length}
                      </span>
                    )}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-60 overflow-y-auto">
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
                    <span className="flex-1">{ingredient} ({count})</span>
                    {filters.ingredients.includes(ingredient) && (
                      <span className="ml-auto">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Time Filters */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 hover:bg-orange-100 rounded-lg cursor-pointer transition-colors">
                <ClockIcon className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">
                  Time
                  {(filters.maxPrepTime || filters.maxCookTime) && (
                    <span className="ml-1 text-xs bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded-full">
                      {(filters.maxPrepTime ? 1 : 0) +
                        (filters.maxCookTime ? 1 : 0)}
                    </span>
                  )}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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

          {/* Rating Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg cursor-pointer transition-colors">
                <span className="text-yellow-600">⭐</span>
                <span className="text-sm font-medium text-yellow-700">
                  Rating
                  {filters.minRating && (
                    <span className="ml-1 text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full">
                      {filters.minRating}+
                    </span>
                  )}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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
                {filters.minRating === 4 && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateFilters({ minRating: 3 })}
                className={filters.minRating === 3 ? "bg-gray-50" : ""}
              >
                3+ stars
                {filters.minRating === 3 && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateFilters({ minRating: 2 })}
                className={filters.minRating === 2 ? "bg-gray-50" : ""}
              >
                2+ stars
                {filters.minRating === 2 && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateFilters({ minRating: 1 })}
                className={filters.minRating === 1 ? "bg-gray-50" : ""}
              >
                1+ stars
                {filters.minRating === 1 && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear All Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <XIcon className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Recipe Recommender - Tablet only (640px-1199px) */}
        <div className="hidden sm:block xl:hidden mt-4">
          <MobileRecipeRecommender
            recipes={recipes}
            availableTags={availableTags}
            availableIngredients={availableIngredients}
            onRecipeSelect={onRecipeSelect}
          />
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
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
        )}
      </div>
    </div>
  );
}
