import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ShoppingCartIcon, ChevronsUpDown as CaretIcon } from "lucide-react";
import toast from "react-hot-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ChevronsUpDown, XIcon } from "lucide-react";
import { IngredientScaler } from "../IngredientScaler";
import { scaleIngredient, parseIngredient } from "../../lib/ingredient-scaling";
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
  const [lists, setLists] = React.useState<any[]>([]);
  const [loadingLists, setLoadingLists] = React.useState(false);
  const [addedToList, setAddedToList] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    (async () => {
      try {
        setLoadingLists(true);
        const res = await fetch("/api/shopping-lists", {
          credentials: "include",
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.success && Array.isArray(json.lists)) {
          setLists(json.lists);
        }
      } catch (_) {
        // ignore
      } finally {
        setLoadingLists(false);
      }
    })();
  }, []);

  const addToList = async (listId: string, text: string) => {
    try {
      const parsed = parseIngredient(text);
      const res = await fetch(`/api/shopping-list-items/${listId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: [
            {
              originalText: text,
              normalizedName: parsed.ingredient || undefined,
              quantity: parsed.amount ? String(parsed.amount) : undefined,
              unit: parsed.unit || undefined,
              recipeId: currentRecipe.id,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      const listName = lists.find((l) => l.id === listId)?.name || "list";
      toast.success(`${text} has been added to the ${listName} shopping list!`);
      setAddedToList((prev) => {
        const next = new Set(prev);
        next.add(text);
        return next;
      });
    } catch (e) {
      toast.error("Failed to add to shopping list");
    }
  };

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
                const scaledIngredient = scaleIngredient(
                  ingredient,
                  ingredientScale
                );
                const alreadyAdded = addedToList.has(scaledIngredient);

                return (
                  <li key={index} className="flex items-start gap-3">
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
                    <div className="flex items-center gap-2">
                      {alreadyAdded ? null : lists.length <= 1 ? (
                        <Button
                          size="sm"
                          className="bg-success-green hover:bg-green-600"
                          disabled={loadingLists}
                          onClick={() =>
                            lists[0]?.id &&
                            addToList(lists[0].id, scaledIngredient)
                          }
                        >
                          <ShoppingCartIcon className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="cursor-pointer"
                            >
                              <ShoppingCartIcon className="w-4 h-4 mr-1" />
                              Add
                              <CaretIcon className="w-3 h-3 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {lists.map((l) => (
                              <DropdownMenuItem
                                key={l.id}
                                onClick={() =>
                                  addToList(l.id, scaledIngredient)
                                }
                                className="cursor-pointer"
                              >
                                {l.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
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
