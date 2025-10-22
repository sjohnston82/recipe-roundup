// src/components/RecipeCard.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { ClockIcon, UsersIcon } from "lucide-react";
import { RecipeModal } from "./RecipeModal";
import { StarRating } from "./StarRating";
import { type Recipe } from "../lib/api-hooks";
import { RecipeTags } from "./RecipeTags";
import { useNavigate } from "@tanstack/react-router";

interface RecipeCardProps {
  recipe: Recipe;
  onTagClick?: (tag: string) => void;
}

export function RecipeCard({ recipe, onTagClick }: RecipeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1200);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleCardClick = () => {
    if (isDesktop) {
      setIsModalOpen(true);
    } else {
      navigate({ to: `/recipe/${recipe.id}` });
    }
  };

  const tagColors = [
    "bg-[#eff6ff] text-[#88a3eb] border-[#88a3eb]/20", // Blue
    "bg-[#f0fdf4] text-[#15803d] border-[#15803d]/20", // Green
    "bg-[#fefce8] text-[#a16206] border-[#a16206]/20", // Yellow
    "bg-[#faf5ff] text-[#7e22ce] border-[#7e22ce]/20", // Purple
    "bg-[#fef2f2] text-[#dc2626] border-[#dc2626]/20", // Red
    "bg-[#f0fdfa] text-[#0d9488] border-[#0d9488]/20", // Teal
  ];

  const getTagColor = (index: number) => {
    return tagColors[index % tagColors.length];
  };

  return (
    <>
      <Card
        className="w-full h-full bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm transition-all duration-200 cursor-pointer flex flex-col hover:shadow-xl hover:-translate-y-0.5 hover:border-gray-300 hover:ring-1 hover:ring-black/5"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-2 flex-shrink-0 h-[56px]">
          <div className="flex h-full items-center justify-center">
            <h3 className="text-lg font-semibold text-gradient-dark line-clamp-2 text-center">
              {recipe.title}
            </h3>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-4 flex-1 flex flex-col">
          {/* Recipe Image */}
          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-100 flex items-center justify-center flex-shrink-0">
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-gray-500">
                <div className="text-2xl mb-1">🍽️</div>
                <p className="text-xs font-medium">No Image Available</p>
              </div>
            )}
          </div>

          {/* Tags (always reserve space) */}
          <div className="h-12 overflow-hidden mb-3">
            {recipe.tags && recipe.tags.length > 0 && (
              <RecipeTags
                getTagColor={getTagColor}
                onTagClick={onTagClick}
                tags={recipe.tags}
              />
            )}
          </div>

          {/* Description (always reserve space) */}
          <div className="b h-[4.5rem] mb-3">
            <p className="text-gray-700 text-[0.95rem] md:text-base leading-6 line-clamp-3 flex-shrink-0 antialiased">
              {recipe.description || ""}
            </p>
          </div>

          {/* Star Rating */}
          <div className="mb-3" onClick={(e) => e.stopPropagation()}>
            <StarRating rating={recipe.rating || 0} readonly size="sm" />
          </div>

          {/* Recipe Meta Info - Compact (anchored to bottom) */}
          <div className="flex flex-col gap-2 mb-3 mt-auto">
            <div className="bg-[#eff6ff]/70 flex justify-between items-center rounded-xl p-3 w-full h-12 border border-[#88a3eb]/20">
              <p className="text-[#88a3eb] font-semibold text-lg">🍽️ Cuisine</p>
              <p className="italic font-semibold text-lg truncate max-w-[55%] text-right">
                {recipe.cuisine ? recipe.cuisine : "No info"}
              </p>
            </div>

            <div className="bg-[#f0fdf4] flex justify-between items-center rounded-xl p-3 w-full h-12 border border-[#15803d]/10">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ClockIcon className="w-4 h-4 text-[#15803d]" />
                <p className="text-[#15803d] font-semibold text-lg">Prep</p>
              </div>
              <p className="font-semibold text-lg italic truncate max-w-[55%] text-right">
                {recipe.prepTime ? recipe.prepTime + " minutes" : "No info"}
              </p>
            </div>
            <div className="bg-[#fefce8] flex justify-between items-center rounded-xl p-3 w-full h-12 border border-[#a16206]/10">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ClockIcon className="w-4 h-4 text-[#15803d]" />
                <p className="text-[#a16206] font-semibold text-lg">
                  Cook Time
                </p>
              </div>
              <p className="font-semibold text-lg italic truncate max-w-[55%] text-right">
                {recipe.cookTime ? recipe.cookTime + " minutes" : "No info"}
              </p>
            </div>

            <div className="flex justify-between items-center bg-[#faf5ff] rounded-xl p-3 w-full h-12 border border-[#7e22ce]/10">
              <div className="flex items-center justify-center gap-1 mb-1">
                <UsersIcon className="w-4 h-4 text-[#7e22ce]" />
                <p className="text-[#7e22ce] font-semibold text-lg">Servings</p>
              </div>
              <p className="italic font-semibold text-lg truncate max-w-[55%] text-right">
                {recipe.servings ? recipe.servings : "No info"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Only render modal on desktop */}
      {isDesktop && (
        <RecipeModal
          recipe={recipe}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

export default RecipeCard;
