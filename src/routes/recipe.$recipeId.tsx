// src/routes/recipe.$recipeId.tsx
import {
  createFileRoute,
  useNavigate,
  Outlet,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ClockIcon,
  UsersIcon,
  GlobeIcon,
  EditIcon,
  SaveIcon,
  XIcon,
  TrashIcon,
  ChevronsUpDown,
  ChefHatIcon,
  MoreHorizontal,
  ArrowLeftIcon,
  ShareIcon,
  Printer,
} from "lucide-react";
import { StarRating } from "../components/StarRating";
import { RecipeNotes } from "../components/RecipeNotes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useRecipes, type Recipe } from "../lib/api-hooks";
import { NutritionInfo } from "@/components/NutritionInfo";
import { Switch } from "../components/ui/switch";
import { scaleServings } from "../lib/ingredient-scaling";
import { useRecipeEditing } from "../lib/recipe-editing";
import { RecipeIngredients } from "../components/shared/RecipeIngredients";
import { FeedbackModal } from "../components/shared/FeedbackModal";
import { getTagColor } from "../lib/tag-colors";

export const Route = createFileRoute("/recipe/$recipeId")({
  component: RecipePage,
});

function RecipePage() {
  const { recipeId } = Route.useParams();
  const navigate = useNavigate();
  const router = useRouter();
  const { data: recipesData } = useRecipes(1, 1000); // Get all recipes to find the one we need
  const recipe = recipesData?.recipes.find((r) => r.id === recipeId);

  // Create a placeholder recipe for the hook when recipe is not found
  const placeholderRecipe: Recipe = {
    id: "",
    title: "",
    description: "",
    ingredients: [],
    instructions: [],
    prepTime: "",
    cookTime: "",
    servings: "",
    cuisine: "",
    tags: [],
    sourceUrl: "",
    imageUrl: "",
    rating: 0,
    lastMadeAt: null,
    nutrition: null,
    notes: [],
    createdAt: "",
  };

  // Always call the hook with either the real recipe or placeholder
  const {
    isEditing,
    editedRecipe,
    currentRecipe,
    showFeedbackModal,
    feedbackRating,
    feedbackNote,
    isShowingIngredients,
    isShowingInstructions,
    isShowingNutrition,
    ingredientScale,
    checkedIngredients,
    updateRecipeMutation,
    deleteRecipeMutation,
    handleEdit,
    handleCancelEdit,
    handleSave,
    handleDelete,
    handleInputChange,
    handleArrayChange,
    addArrayItem,
    removeArrayItem,
    handleMadeToday,
    handleFeedbackSubmit,
    handleNutritionChange,
    formatLastMade,
    toggleIngredientCheck,
    setShowFeedbackModal,
    setFeedbackRating,
    setFeedbackNote,
    setIsShowingIngredients,
    setIsShowingInstructions,
    setIsShowingNutrition,
    setIngredientScale,
  } = useRecipeEditing(recipe || placeholderRecipe);

  // Cook Mode (keep screen awake on mobile) — MUST be before any early returns
  const [isCookModeOn, setIsCookModeOn] = useState(false);
  const wakeLockRef = useRef<any>(null);
  const requestWakeLock = async () => {
    try {
      if (typeof (navigator as any).wakeLock?.request === "function") {
        wakeLockRef.current = await (navigator as any).wakeLock.request(
          "screen"
        );
      }
    } catch (_) {
      // ignore
    }
  };
  const releaseWakeLock = async () => {
    try {
      await wakeLockRef.current?.release?.();
    } catch (_) {
    } finally {
      wakeLockRef.current = null;
    }
  };
  useEffect(() => {
    if (isCookModeOn) requestWakeLock();
    else releaseWakeLock();
    return () => {
      releaseWakeLock();
    };
  }, [isCookModeOn]);
  useEffect(() => {
    const onVisibilityChange = () => {
      if (isCookModeOn && document.visibilityState === "visible") {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [isCookModeOn]);

  // If a child route like /print or /cook is active, render it exclusively
  const matches = router.state.matches;
  const leafId = matches[matches.length - 1]?.id;
  const isChildFullView =
    leafId === "/recipe/$recipeId/print" || leafId === "/recipe/$recipeId/cook";
  if (isChildFullView) {
    return <Outlet />;
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-text mb-4">Recipe not found</p>
          <Button onClick={() => navigate({ to: "/" })}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Recipes
          </Button>
        </div>
      </div>
    );
  }

  const handleDeleteWithNavigate = () => {
    handleDelete(() => {
      navigate({ to: "/" });
    });
  };

  const handleShare = async () => {
    try {
      const response = await fetch("/api/share-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipeId: currentRecipe.id }),
      });

      const data = await response.json();

      if (data.success) {
        // Copy to clipboard
        await navigator.clipboard.writeText(data.shareUrl);

        // Create a simple toast notification
        const toast = document.createElement("div");
        toast.className =
          "fixed top-4 right-4 z-50 bg-green-50 border border-green-500 text-green-900 px-4 py-2 rounded-md shadow-lg transition-all";
        toast.textContent = "Share link copied to clipboard!";
        document.body.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 3000);
      } else {
        // Error toast
        const toast = document.createElement("div");
        toast.className =
          "fixed top-4 right-4 z-50 bg-red-50 border border-red-500 text-red-900 px-4 py-2 rounded-md shadow-lg transition-all";
        toast.textContent = "Failed to generate share link";
        document.body.appendChild(toast);

        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 3000);
      }
    } catch (error) {
      console.error("Error sharing recipe:", error);
      // Error toast
      const toast = document.createElement("div");
      toast.className =
        "fixed top-4 right-4 z-50 bg-red-50 border border-red-500 text-red-900 px-4 py-2 rounded-md shadow-lg transition-all";
      toast.textContent = "Failed to generate share link";
      document.body.appendChild(toast);

      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Recipes
          </Button>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" aria-haspopup="menu">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  collisionPadding={8}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  className="z-50 w-56"
                >
                  <DropdownMenuItem
                    onClick={() =>
                      navigate({ to: `/recipe/${currentRecipe.id}/cook` })
                    }
                  >
                    Cook Mode
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      navigate({ to: `/recipe/${currentRecipe.id}/print` })
                    }
                  >
                    Print Recipe
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEdit}>
                    <EditIcon className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare}>
                    <ShareIcon className="h-4 w-4 mr-2" />
                    Share This Recipe
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeleteWithNavigate}
                    className="text-red-600"
                    disabled={deleteRecipeMutation.isPending}
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    {deleteRecipeMutation.isPending ? "Deleting..." : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Recipe Title */}
        <div className="mb-6">
          {isEditing ? (
            <Input
              value={editedRecipe?.title || ""}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="text-2xl font-bold"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gradient-dark">
              {currentRecipe.title}
            </h1>
          )}
        </div>

        {/* Rest of the content - same structure as modal */}
        <div className="space-y-6">
          {/* Recipe Image */}
          <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            {currentRecipe.imageUrl ? (
              <img
                src={currentRecipe.imageUrl}
                alt={currentRecipe.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">🍽️</div>
                <p className="text-lg font-medium">No Image Available</p>
              </div>
            )}
          </div>

          {/* Description */}
          {(currentRecipe.description || isEditing) && (
            <div>
              <Label className="text-lg font-semibold text-gradient-dark">
                Description
              </Label>
              {isEditing ? (
                <Input
                  value={editedRecipe?.description || ""}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Recipe description..."
                  className="mt-2"
                />
              ) : (
                <p className="text-muted-text mt-2">
                  {currentRecipe.description}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <StarRating
              rating={currentRecipe.rating || 0}
              onRatingChange={
                !isEditing
                  ? (newRating) => {
                      updateRecipeMutation.mutate({
                        ...currentRecipe,
                        rating: newRating,
                      });
                    }
                  : undefined
              }
              readonly={isEditing}
              size="lg"
            />
            {!isEditing && (
              <div className="flex flex-col items-end gap-2">
                <Button
                  onClick={handleMadeToday}
                  disabled={updateRecipeMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                >
                  <ChefHatIcon className="h-4 w-4 mr-2" />I Made This Today
                </Button>
                {currentRecipe.lastMadeAt && (
                  <p className="text-sm text-gray-600">
                    Last made: {formatLastMade(currentRecipe.lastMadeAt)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Cook Mode + Print controls */}
          {!isEditing && (
            <div className="flex flex-wrap items-center justify-between gap-3 mt-3 mb-6">
              <div className="flex items-center gap-3">
                <Switch
                  id="cook-mode"
                  checked={isCookModeOn}
                  onCheckedChange={setIsCookModeOn}
                />
                <Label htmlFor="cook-mode" className="text-sm text-gray-700">
                  Cook Mode
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() =>
                    window.open(
                      `/recipe/${currentRecipe.id}/print`,
                      "_blank",
                      "noopener"
                    )
                  }
                  variant="outline"
                  className="hover:bg-gray-50"
                >
                  <Printer className="h-4 w-4 mr-2" /> Print Recipe
                </Button>
              </div>
            </div>
          )}

          {/* Recipe Meta Info */}
          <div className="flex flex-col gap-2 mb-3">
            <div className="bg-[#eff6ff] flex justify-between rounded-xl p-3 w-full">
              <p className="text-[#88a3eb] font-semibold text-lg">🍽️ Cuisine</p>
              {isEditing ? (
                <Input
                  value={editedRecipe?.cuisine || ""}
                  onChange={(e) => handleInputChange("cuisine", e.target.value)}
                  placeholder="e.g., Italian, Mexican"
                  className="max-w-[200px] text-right"
                />
              ) : (
                <p className="italic font-semibold text-lg">
                  {currentRecipe.cuisine ? currentRecipe.cuisine : "No info"}
                </p>
              )}
            </div>

            <div className="bg-[#f0fdf4] flex justify-between rounded-xl p-3 w-full">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ClockIcon className="w-4 h-4 text-[#15803d]" />
                <p className="text-[#15803d] font-semibold text-lg">Prep</p>
              </div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={editedRecipe?.prepTime || ""}
                    onChange={(e) =>
                      handleInputChange("prepTime", e.target.value)
                    }
                    placeholder="15"
                    className="max-w-[80px] text-right"
                  />
                  <span className="font-semibold text-lg">minutes</span>
                </div>
              ) : (
                <p className="font-semibold text-lg italic">
                  {currentRecipe.prepTime
                    ? currentRecipe.prepTime + " minutes"
                    : "No info"}
                </p>
              )}
            </div>
            <div className="bg-[#fefce8] flex justify-between rounded-xl p-3 w-full">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ClockIcon className="w-4 h-4 text-[#15803d]" />
                <p className="text-[#a16206] font-semibold text-lg">
                  Cook Time
                </p>
              </div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={editedRecipe?.cookTime || ""}
                    onChange={(e) =>
                      handleInputChange("cookTime", e.target.value)
                    }
                    placeholder="30"
                    className="max-w-[80px] text-right"
                  />
                  <span className="font-semibold text-lg">minutes</span>
                </div>
              ) : (
                <p className="font-semibold text-lg italic">
                  {currentRecipe.cookTime
                    ? currentRecipe.cookTime + " minutes"
                    : "No info"}
                </p>
              )}
            </div>

            <div className="flex justify-between bg-[#faf5ff] rounded-xl p-3">
              <div className="flex items-center justify-center gap-1 mb-1">
                <UsersIcon className="w-4 h-4 text-[#7e22ce]" />
                <p className="text-[#7e22ce] font-semibold text-lg">Servings</p>
              </div>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedRecipe?.servings || ""}
                  onChange={(e) =>
                    handleInputChange("servings", e.target.value)
                  }
                  placeholder="4"
                  className="max-w-[80px] text-right"
                />
              ) : (
                <p className="italic font-semibold text-lg">
                  {scaleServings(currentRecipe.servings, ingredientScale) ||
                    "No info"}
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          {(currentRecipe.tags && currentRecipe.tags.length > 0) ||
          isEditing ? (
            <div>
              <Label className="text-lg font-semibold text-gradient-dark">
                Tags
              </Label>
              {isEditing ? (
                <div className="mt-2 space-y-2">
                  {editedRecipe?.tags?.map((tag, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={tag}
                        onChange={(e) =>
                          handleArrayChange("tags", index, e.target.value)
                        }
                        placeholder="Tag name"
                      />
                      <Button
                        onClick={() => removeArrayItem("tags", index)}
                        variant="outline"
                        size="sm"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() => addArrayItem("tags")}
                    variant="outline"
                    size="sm"
                  >
                    Add Tag
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentRecipe.tags?.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={`${getTagColor(
                        index
                      )} hover:opacity-80 transition-opacity`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {/* Ingredients */}
          <RecipeIngredients
            currentRecipe={currentRecipe}
            isEditing={isEditing}
            isShowingIngredients={isShowingIngredients}
            setIsShowingIngredients={setIsShowingIngredients}
            ingredientScale={ingredientScale}
            setIngredientScale={setIngredientScale}
            checkedIngredients={checkedIngredients}
            toggleIngredientCheck={toggleIngredientCheck}
            handleArrayChange={handleArrayChange}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
          />

          {/* Instructions */}
          <Collapsible
            open={isShowingInstructions}
            onOpenChange={setIsShowingInstructions}
            className="flex flex-col gap-2"
          >
            <div>
              <div className="flex justify-between">
                <Label className="text-lg font-semibold text-gradient-dark flex items-center">
                  <span className="w-2 h-2 bg-accent-peach rounded-full mr-2"></span>
                  Instructions ({currentRecipe.instructions.length} steps)
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
                  {editedRecipe?.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1">
                        <Label className="text-sm text-gray-600">
                          Step {index + 1}
                        </Label>
                        <Input
                          value={instruction}
                          onChange={(e) =>
                            handleArrayChange(
                              "instructions",
                              index,
                              e.target.value
                            )
                          }
                          placeholder="Instruction step"
                        />
                      </div>
                      <Button
                        onClick={() => removeArrayItem("instructions", index)}
                        variant="outline"
                        size="sm"
                        className="mt-6"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() => addArrayItem("instructions")}
                    variant="outline"
                    size="sm"
                  >
                    Add Step
                  </Button>
                </div>
              ) : (
                <CollapsibleContent className="flex flex-col gap-2">
                  <ol className="space-y-3 mt-2">
                    {currentRecipe.instructions.map((instruction, index) => (
                      <li
                        key={index}
                        className="text-muted-text flex items-start"
                      >
                        <span className="bg-gradient-dark text-white text-sm rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </CollapsibleContent>
              )}
            </div>
          </Collapsible>

          <Collapsible
            open={isShowingNutrition}
            onOpenChange={setIsShowingNutrition}
            className="flex flex-col gap-2"
          >
            <div>
              <div className="flex justify-between">
                <Label className="text-lg font-semibold text-gradient-dark flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Nutrition Information
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
              <CollapsibleContent className="flex flex-col gap-2">
                <NutritionInfo
                  nutrition={currentRecipe.nutrition ?? null}
                  isEditing={isEditing}
                  onNutritionChange={
                    isEditing ? handleNutritionChange : undefined
                  }
                />
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Notes */}
          <div className="pt-4 border-t border-gray-100">
            <RecipeNotes
              recipeId={currentRecipe.id}
              notes={currentRecipe.notes || []}
              onNotesUpdate={() => {}}
            />
          </div>

          {/* Source URL */}
          <div className="pt-4 border-t border-gray-100">
            <Label className="text-lg font-semibold text-gradient-dark">
              Source
            </Label>
            {isEditing ? (
              <Input
                value={editedRecipe?.sourceUrl || ""}
                onChange={(e) => handleInputChange("sourceUrl", e.target.value)}
                placeholder="https://example.com/recipe"
                className="mt-2"
              />
            ) : (
              <a
                href={currentRecipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gradient-light hover:text-gradient-dark transition-colors inline-flex items-center mt-2"
              >
                <GlobeIcon className="w-4 h-4 mr-2" />
                View Original Recipe
              </a>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-center gap-4 pt-4 border-t border-gray-100">
              <Button
                onClick={handleSave}
                disabled={updateRecipeMutation.isPending}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <SaveIcon className="h-4 w-4 mr-1" />
                {updateRecipeMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button onClick={handleCancelEdit} variant="outline" size="sm">
                <XIcon className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        feedbackRating={feedbackRating}
        setFeedbackRating={setFeedbackRating}
        feedbackNote={feedbackNote}
        setFeedbackNote={setFeedbackNote}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
}
