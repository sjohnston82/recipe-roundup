// src/routes/recipe.$recipeId.print.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { useRecipes, type Recipe } from "../lib/api-hooks";
import { ArrowLeftIcon, Printer } from "lucide-react";

export const Route = createFileRoute("/recipe/$recipeId/print")({
  component: PrintRecipePage,
});

function PrintRecipePage() {
  const { recipeId } = Route.useParams();
  const navigate = useNavigate();
  const { data: recipesData } = useRecipes(1, 1000);
  const recipe: Recipe | undefined = recipesData?.recipes.find(
    (r) => r.id === recipeId
  );

  useEffect(() => {
    // Make screen version look like print: hide header, remove top padding, white bg
    document.body.classList.add("print-view");
    return () => {
      document.body.classList.remove("print-view");
    };
  }, []);

  if (!recipe) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-text mb-4">Recipe not found</p>
          <Button onClick={() => navigate({ to: "/" })}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to Recipes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="print-container">
      {/* Screen-only controls */}
      <div className="no-print sticky top-16 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 grid grid-cols-3 items-center">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: `/recipe/${recipe.id}` })}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="text-center text-sm text-gray-600 font-medium">
            Printable Version
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => window.print()}
              className="bg-gradient-to-r from-gradient-dark to-gradient-light text-white"
            >
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
          </div>
        </div>
      </div>

      {/* Printable content */}
      <div className="max-w-3xl mx-auto px-6 py-8 print:p-0 print:max-w-none">
        <h1 className="text-3xl font-bold mb-2 print:mb-2">{recipe.title}</h1>
        {recipe.imageUrl && (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-auto rounded-lg mb-6 print:mb-4"
          />
        )}
        {recipe.description && (
          <p className="text-gray-700 mb-6 print:mb-4">{recipe.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
            <ul className="list-disc pl-6 space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-3">Instructions</h2>
            <ol className="list-decimal pl-6 space-y-2">
              {recipe.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrintRecipePage;
