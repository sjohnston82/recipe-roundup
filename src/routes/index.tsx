import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession } from "../lib/auth-client";
import { Button } from "../components/ui/button";
import RecipeCard from "../components/RecipeCard";
import {
  FixedRecipeFilters,
  type FilterOptions,
} from "../components/FixedRecipeFilters";
import { RecipeSidebar } from "../components/RecipeSidebar";
import { useState, useEffect } from "react";
import { useRecipes, type Recipe } from "../lib/api-hooks";
import SearchBar from "../components/SearchBar";
import { RecipeModal } from "../components/RecipeModal";

const defaultFilters: FilterOptions = {
  sortBy: "recent",
  sortOrder: "desc",
  cuisine: [],
  tags: [],
  ingredients: [],
  maxPrepTime: undefined,
  maxCookTime: undefined,
  minRating: undefined,
};

export const Route = createFileRoute("/")({
  component: HomePage,
});

// Feature carousel data
const features = [
  {
    title: "Recipe Scraping Magic",
    description:
      "Simply paste any recipe URL and watch as we automatically extract all the ingredients, instructions, and even the image. No more manual copying and pasting—your favorite recipes are just one click away.",
    image:
      "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=600&fit=crop",
    gradient: "from-gradient-dark to-gradient-light",
  },
  {
    title: "Smart Ingredient Scaling",
    description:
      "Hosting a dinner party or cooking for one? Instantly scale any recipe to your desired serving size. Our intelligent system adjusts all ingredients proportionally, ensuring perfect results every time.",
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop",
    gradient: "from-accent-teal to-success-green",
  },
  {
    title: "Powerful Search & Filter",
    description:
      "Find exactly what you're craving in seconds. Search by ingredient, cuisine, cooking time, or dietary preferences. Our advanced filters help you discover the perfect recipe for any occasion.",
    image:
      "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&h=600&fit=crop",
    gradient: "from-accent-peach to-danger-red",
  },
  {
    title: "Personal Recipe Notes",
    description:
      "Make each recipe your own with custom notes and ratings. Remember your tweaks, substitutions, and tips for next time. Your culinary journey, documented and refined with every dish.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
    gradient: "from-gradient-light to-accent-teal",
  },
  {
    title: "Beautiful Organization",
    description:
      "Tag, categorize, and organize your recipes exactly how you want. Create custom collections for meal prep, special occasions, or family favorites. Your recipes, your way.",
    image:
      "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800&h=600&fit=crop",
    gradient: "from-success-green to-gradient-dark",
  },
];

function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Trigger animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("why-section");
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Hero Section with Carousel - Full Screen */}
      <section className="min-h-[calc(100svh-4rem-env(safe-area-inset-top))] relative overflow-hidden isolate">
        {/* Carousel Background */}
        <div className="absolute inset-0">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="absolute inset-0 bg-black/40 z-10" />
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-20 min-h-full flex items-center pt-6 sm:pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center md:place-items-center">
              {/* Left Side - Main Hero */}
              <div className="text-white">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  Your Recipe Collection,
                  <span className="block bg-gradient-to-r from-accent-teal to-success-green bg-clip-text text-transparent">
                    Reimagined
                  </span>
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
                  The modern way to save, organize, and cook from your favorite
                  recipes. Beautiful, simple, and designed for home cooks who
                  love great food.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/signup">
                    <Button
                      size="lg"
                      className="bg-white text-gradient-dark cursor-pointer hover:bg-gray-100 px-8 py-6 text-lg font-semibold w-full sm:w-auto"
                    >
                      Start Cooking Free
                    </Button>
                  </Link>
                  <Link to="/signin">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-white text-black cursor-pointer hover:bg-white hover:text-gradient-dark px-8 py-6 text-lg font-semibold w-full sm:w-auto"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>

                {/* Stats removed to reduce vertical clutter */}
              </div>

              {/* Right Side - Feature Carousel */}
              <div className="relative md:justify-self-center">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                  {/* Carousel Content */}
                  <div className="relative overflow-hidden">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className={`transition-all duration-700 ${
                          index === currentSlide
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 absolute inset-0 translate-x-full"
                        }`}
                      >
                        {/* Checkmark badge: visible on md+ to preserve desktop look */}
                        <div
                          className={`hidden md:flex w-16 h-16 rounded-full bg-gradient-to-r ${feature.gradient} items-center justify-center mb-6`}
                        >
                          <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-base md:text-lg text-white/90 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Carousel Controls */}
                  <div className="flex items-center justify-between mt-8">
                    <div className="flex gap-2">
                      {features.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`h-2 rounded-full transition-all ${
                            index === currentSlide
                              ? "w-8 bg-white"
                              : "w-2 bg-white/40 hover:bg-white/60"
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={prevSlide}
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        aria-label="Previous slide"
                      >
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={nextSlide}
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        aria-label="Next slide"
                      >
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-2 sm:bottom-0 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Why Choose Recipe Roundup - Animated Slide In */}
      <section id="why-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`transition-all duration-[1400ms] text-center ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-20"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gradient-dark mb-6 text-center">
              Save recipes without the noise
            </h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg md:text-xl text-muted-text leading-relaxed mb-4">
                Keep every ingredient, step, and note in one clean, ad‑free
                place. Paste a link or add your own—Recipe Roundup stores the
                essentials so you can cook without pop‑ups, paywalls, or
                clutter.
              </p>
              <p className="text-lg md:text-xl text-muted-text leading-relaxed">
                Fast search, simple tags, and quick scaling make it effortless
                to find and use your recipes when you actually need them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof removed */}

      {/* Final CTA */}
      <section className="py-20 bg-bg-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient-dark mb-6">
            Ready to Transform Your Cooking?
          </h2>
          <p className="text-xl text-muted-text mb-8 max-w-2xl mx-auto">
            Join the Recipe Roundup community today and experience the joy of
            perfectly organized recipes.
          </p>
          <Link to="/signup">
            <Button
              size="lg"
              className="bg-gradient-to-r from-gradient-dark to-gradient-light text-white hover:opacity-90 px-12 py-6 text-xl font-semibold"
            >
              Get Started for Free
            </Button>
          </Link>
          <p className="text-sm text-muted-text mt-4">
            No credit card required • Free forever
          </p>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const {
    data: recipesData,
    isLoading,
    error,
  } = useRecipes(currentPage, itemsPerPage);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  const recipes = recipesData?.recipes || [];
  const pagination = recipesData?.pagination;

  const availableCuisines = Array.from(
    new Set(recipes.map((r: Recipe) => r.cuisine).filter(Boolean))
  ) as string[];

  // Create unique tags with counts, sorted by count (highest to lowest)
  const tagCounts = recipes.reduce(
    (acc: Record<string, number>, recipe: Recipe) => {
      if (recipe.tags) {
        recipe.tags.forEach((tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
      }
      return acc;
    },
    {}
  );

  const availableTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a) // Sort by count, highest first
    .map(([tag, count]) => ({ tag, count }));

  // Extract ingredient names from full ingredient strings
  const extractIngredientName = (ingredientString: string): string => {
    // Remove common measurements and quantities
    const cleaned = ingredientString
      .toLowerCase()
      .trim()
      // Remove quantities like "1", "2", "1/2", "1.5", etc.
      .replace(/^\d+(\.\d+)?(\s*\/\s*\d+)?(\s*-\s*\d+)?(\s*to\s*\d+)?\s+/, "")
      // Remove common measurements
      .replace(
        /^(cup|cups|tablespoon|tablespoons|tbsp|teaspoon|teaspoons|tsp|pound|pounds|lb|lbs|ounce|ounces|oz|gram|grams|g|kilogram|kilograms|kg|liter|liters|l|milliliter|milliliters|ml|pint|pints|quart|quarts|gallon|gallons|inch|inches|clove|cloves|slice|slices|piece|pieces|can|cans|jar|jars|package|packages|bag|bags|box|boxes)\s+/,
        ""
      )
      // Remove descriptors like "chopped", "diced", "fresh", etc.
      .replace(
        /\b(fresh|dried|chopped|diced|sliced|minced|grated|shredded|crushed|ground|whole|halved|quartered|peeled|cooked|raw|frozen|canned|organic|large|small|medium|extra|fine|coarse|thick|thin|heavy|light|unsalted|salted|sweet|sour|hot|cold|warm|room\s+temperature)\b\s*/g,
        ""
      )
      // Remove parenthetical information
      .replace(/\([^)]*\)/g, "")
      // Remove extra whitespace
      .replace(/\s+/g, " ")
      .trim();

    // Take the first significant word(s) as the ingredient name
    const words = cleaned.split(" ");
    // For compound ingredients, take up to 2 words
    return words.slice(0, 2).join(" ").trim();
  };

  // Create unique ingredients with counts, sorted by count (highest to lowest)
  const ingredientCounts = recipes.reduce(
    (acc: Record<string, number>, recipe: Recipe) => {
      if (recipe.ingredients) {
        recipe.ingredients.forEach((ingredient) => {
          const cleanIngredient = extractIngredientName(ingredient);
          if (cleanIngredient && cleanIngredient.length > 1) {
            // Only include meaningful ingredient names
            acc[cleanIngredient] = (acc[cleanIngredient] || 0) + 1;
          }
        });
      }
      return acc;
    },
    {}
  );

  const availableIngredients = Object.entries(ingredientCounts)
    .sort(([, a], [, b]) => b - a) // Sort by count, highest first
    .map(([ingredient, count]) => ({ ingredient, count }));

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredRecipes = recipes
    .filter((recipe: Recipe) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = recipe.title.toLowerCase().includes(query);
        const matchesDescription = recipe.description
          ?.toLowerCase()
          .includes(query);
        const matchesCuisine = recipe.cuisine?.toLowerCase().includes(query);
        const matchesTags = recipe.tags?.some((tag) =>
          tag.toLowerCase().includes(query)
        );
        const matchesIngredients = recipe.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(query)
        );
        const matchesInstructions = recipe.instructions.some((instruction) =>
          instruction.toLowerCase().includes(query)
        );

        if (
          !matchesTitle &&
          !matchesDescription &&
          !matchesCuisine &&
          !matchesTags &&
          !matchesIngredients &&
          !matchesInstructions
        ) {
          return false;
        }
      }
      // Cuisine filter
      if (
        filters.cuisine.length &&
        (!recipe.cuisine || !filters.cuisine.includes(recipe.cuisine))
      ) {
        return false;
      }
      // Category filter
      // if (
      //   filters.tags.length &&
      //   (!recipe.tags ||
      //     !recipe.tags.some((tag: string) =>
      //       filters.tags.includes(tag)
      //     ))
      // ) {
      //   return false;
      // }
      // Tag filter
      if (
        filters.tags.length &&
        (!recipe.tags ||
          !recipe.tags.some((tag: string) => filters.tags.includes(tag)))
      ) {
        return false;
      }
      // Ingredient filter
      if (
        filters.ingredients.length &&
        !recipe.ingredients.some((ingredient: string) =>
          filters.ingredients.some((filterIngredient: string) =>
            ingredient.toLowerCase().includes(filterIngredient.toLowerCase())
          )
        )
      ) {
        return false;
      }
      // Prep time filter
      if (
        filters.maxPrepTime !== undefined &&
        recipe.prepTime &&
        Number(recipe.prepTime) > filters.maxPrepTime
      ) {
        return false;
      }
      // Cook time filter
      if (
        filters.maxCookTime !== undefined &&
        recipe.cookTime &&
        Number(recipe.cookTime) > filters.maxCookTime
      ) {
        return false;
      }
      // Rating filter
      if (
        filters.minRating !== undefined &&
        (!recipe.rating || recipe.rating < filters.minRating)
      ) {
        return false;
      }
      return true;
    })
    .sort((a: Recipe, b: Recipe) => {
      // Sorting logic
      switch (filters.sortBy) {
        case "title":
          return filters.sortOrder === "asc"
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        case "prepTime":
          return filters.sortOrder === "asc"
            ? Number(a.prepTime ?? 0) - Number(b.prepTime ?? 0)
            : Number(b.prepTime ?? 0) - Number(a.prepTime ?? 0);
        case "cookTime":
          return filters.sortOrder === "asc"
            ? Number(a.cookTime ?? 0) - Number(b.cookTime ?? 0)
            : Number(b.cookTime ?? 0) - Number(a.cookTime ?? 0);
        case "rating":
          return filters.sortOrder === "asc"
            ? Number(a.rating ?? 0) - Number(b.rating ?? 0)
            : Number(b.rating ?? 0) - Number(a.rating ?? 0);
        case "recent":
        default: {
          const aTs = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTs = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return filters.sortOrder === "asc" ? aTs - bTs : bTs - aTs;
        }
      }
    });

  if (session) {
    return (
      <div className="min-h-screen bg-bg-light">
        {/* Desktop Sidebar - Only visible on screens > 1200px */}
        <div className="hidden xl:block">
          <RecipeSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            availableCuisines={availableCuisines}
            availableTags={availableTags}
            availableIngredients={availableIngredients}
            recipes={recipes}
            onSearch={handleSearch}
            onRecipeSelect={(recipe) => {
              setSelectedRecipe(recipe);
              setIsRecipeModalOpen(true);
            }}
          />
        </div>

        {/* Main Content - Adjusted for sidebar on desktop */}
        <div className="xl:ml-80">
          {/* Header Section - Mobile/Tablet only */}
          <div className="bg-bg-light pt-12 pb-6 xl:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gradient-dark mb-4">
                  Welcome back, {session.user?.name || session.user?.email}!
                </h1>
                <p className="text-xl text-muted-text">
                  Ready to discover and save your next favorite recipe?
                </p>
              </div>

              <div className="flex justify-center mb-6">
                <Link to="/add-recipe">
                  <Button className="bg-gradient-to-r from-gradient-dark to-gradient-light hover:opacity-90 transition-opacity">
                    Add Recipe
                  </Button>
                </Link>
              </div>

              {/* Search Bar - Mobile/Tablet only */}
              <div className="flex justify-center mb-6">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>
          </div>

          {/* Desktop Header - Desktop only */}
          <div className="hidden xl:block bg-bg-light pt-12 pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gradient-dark mb-4">
                  Welcome back, {session.user?.name || session.user?.email}!
                </h1>
                <p className="text-xl text-muted-text">
                  Ready to discover and save your next favorite recipe?
                </p>
              </div>
            </div>
          </div>

          {/* Fixed Filters - Mobile/Tablet only */}
          <div className="xl:hidden">
            <FixedRecipeFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              availableCuisines={availableCuisines}
              availableTags={availableTags}
              availableIngredients={availableIngredients}
              recipes={recipes}
              onRecipeSelect={(recipe) => {
                setSelectedRecipe(recipe);
                setIsRecipeModalOpen(true);
              }}
            />
          </div>

          {/* Pagination Controls moved to bottom */}

          {/* Recipe Content */}
          <div className="max-w-[1690px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gradient-dark"></div>
                <p className="mt-2 text-muted-text">Loading recipes...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-danger-red">
                  Failed to load recipes. Please try again.
                </p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredRecipes.map((recipe: Recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onTagClick={(tag) => {
                        setFilters({
                          ...filters,
                          tags: [tag],
                        });
                      }}
                    />
                  ))}
                </div>
                {filteredRecipes.length === 0 && recipes.length > 0 && (
                  <p className="text-center text-muted-text">
                    No recipes match your filters.
                  </p>
                )}
                {recipes.length === 0 && (
                  <p className="text-center text-muted-text">
                    No recipes found. Add some!
                  </p>
                )}

                {/* Pagination Controls - Bottom, mobile-friendly */}
                <div className="pt-6 pb-10">
                  <div className="max-w-[1690px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                      <div className="flex items-center justify-center sm:justify-start gap-3">
                        <label
                          htmlFor="items-per-page"
                          className="text-sm font-medium text-muted-text"
                        >
                          Items per page:
                        </label>
                        <select
                          id="items-per-page"
                          value={itemsPerPage}
                          onChange={(e) =>
                            handleItemsPerPageChange(Number(e.target.value))
                          }
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm w-full max-w-[160px] sm:w-auto sm:max-w-none"
                        >
                          <option value={12}>12</option>
                          <option value={24}>24</option>
                          <option value={40}>40</option>
                        </select>
                      </div>

                      {pagination && (
                        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
                          <span className="text-sm text-muted-text text-center sm:text-left">
                            Page {pagination.currentPage} of{" "}
                            {pagination.totalPages} ({pagination.totalCount}{" "}
                            total recipes)
                          </span>
                          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() =>
                                handlePageChange(pagination.currentPage - 1)
                              }
                              disabled={!pagination.hasPrevPage}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() =>
                                handlePageChange(pagination.currentPage + 1)
                              }
                              disabled={!pagination.hasNextPage}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Recipe Modal */}
          {selectedRecipe && (
            <RecipeModal
              recipe={selectedRecipe}
              isOpen={isRecipeModalOpen}
              onClose={() => {
                setIsRecipeModalOpen(false);
                setSelectedRecipe(null);
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return <LandingPage />;
}
