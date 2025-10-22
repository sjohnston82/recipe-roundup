import { useState } from "react";
import { Button } from "./ui/button";
import { SparklesIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { RecipeRecommender } from "./RecipeRecommender";
import { type Recipe } from "../lib/api-hooks";

interface RecipeRecommenderModalProps {
  recipes: Recipe[];
  availableTags: { tag: string; count: number }[];
  availableIngredients: { ingredient: string; count: number }[];
  onRecipeSelect?: (recipe: Recipe) => void;
}

export function RecipeRecommenderModal({
  recipes,
  availableTags,
  availableIngredients,
  onRecipeSelect,
}: RecipeRecommenderModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleRecipeSelect = (recipe: Recipe) => {
    onRecipeSelect?.(recipe);
    setIsOpen(false); // Close modal after selection
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3">
          <SparklesIcon className="w-5 h-5 mr-2" />
          Recipe Recommender
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient-dark flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-blue-600" />
            Recipe Recommender
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <RecipeRecommender
            recipes={recipes}
            availableTags={availableTags}
            availableIngredients={availableIngredients}
            onRecipeSelect={handleRecipeSelect}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
