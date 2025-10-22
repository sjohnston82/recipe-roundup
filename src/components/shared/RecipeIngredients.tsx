import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronsUpDown, XIcon } from "lucide-react";
import { IngredientScaler } from "../IngredientScaler";
import { scaleIngredient } from "../../lib/ingredient-scaling";
import { formatIngredientWithBoldMeasurements } from "../../lib/ingredient-formatting";
import type { Recipe } from "../../lib/api-hooks";

interface RecipeIngredientsProps {
  currentRecipe: Recipe;
  isEditing: boolean;
  isShowingIngredients: boolean;
  setIsShowingIngredients: (showing: boolean) => void;
  ingredientScale: number;
  setIngredientScale: (scale: number) => void;
  checkedIngredients: Set<number>;
  toggleIngredientCheck: (index: number) => void;
  handleArrayChange: (
    field: "ingredients" | "instructions" | "tags",
    index: number,
    value: string
  ) => void;
  addArrayItem: (field: "ingredients" | "instructions" | "tags") => void;
  removeArrayItem: (
    field: "ingredients" | "instructions" | "tags",
    index: number
  ) => void;
}

export function RecipeIngredients({
  currentRecipe,
  isEditing,
  isShowingIngredients,
  setIsShowingIngredients,
  ingredientScale,
  setIngredientScale,
  checkedIngredients,
  toggleIngredientCheck,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
}: RecipeIngredientsProps) {
  return (
    <Collapsible
      open={isShowingIngredients}
      onOpenChange={setIsShowingIngredients}
      className="flex flex-col gap-2"
    >
      <div>
        <div className="flex justify-between w-full">
          <Label className="text-lg font-semibold text-gradient-dark flex items-center">
            <span className="w-2 h-2 bg-accent-teal rounded-full mr-2"></span>
            Ingredients ({currentRecipe.ingredients.length})
          </Label>
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
        {isEditing ? (
          <div className="mt-2 space-y-2">
            {currentRecipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={ingredient}
                  onChange={(e) =>
                    handleArrayChange("ingredients", index, e.target.value)
                  }
                  placeholder="Ingredient"
                />
                <Button
                  onClick={() => removeArrayItem("ingredients", index)}
                  variant="outline"
                  size="sm"
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={() => addArrayItem("ingredients")}
              variant="outline"
              size="sm"
            >
              Add Ingredient
            </Button>
          </div>
        ) : (
          <CollapsibleContent className="flex flex-col gap-2">
            <IngredientScaler
              currentScale={ingredientScale}
              onScaleChange={setIngredientScale}
            />
            <ul className="space-y-2 mt-2">
              {currentRecipe.ingredients.map((ingredient, index) => {
                const isChecked = checkedIngredients.has(index);
                const scaledIngredient = scaleIngredient(ingredient, ingredientScale);
                
                return (
                  <li
                    key={index}
                    className="flex items-start gap-3"
                  >
                    <Checkbox
                      id={`ingredient-${index}`}
                      checked={isChecked}
                      onCheckedChange={() => toggleIngredientCheck(index)}
                      className="mt-1"
                    />
                    <label
                      htmlFor={`ingredient-${index}`}
                      className={`text-muted-text cursor-pointer flex-1 ${
                        isChecked ? "line-through opacity-60" : ""
                      }`}
                    >
                      {formatIngredientWithBoldMeasurements(scaledIngredient)}
                    </label>
                  </li>
                );
              })}
            </ul>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
}
