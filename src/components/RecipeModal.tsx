import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
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
  ShareIcon,
} from "lucide-react";
import { StarRating } from "./StarRating";
import { RecipeNotes } from "./RecipeNotes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import { NutritionInfo } from "./NutritionInfo";
import { IngredientScaler } from "./IngredientScaler";
import { scaleServings, scaleIngredient } from "../lib/ingredient-scaling";
import { useRecipeEditing } from "../lib/recipe-editing";
import { RecipeIngredients } from "./shared/RecipeIngredients";
import { FeedbackModal } from "./shared/FeedbackModal";
import { getTagColor } from "../lib/tag-colors";
import type { Recipe } from "../lib/api-hooks";


interface RecipeModalProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
}

export function RecipeModal({ recipe, isOpen, onClose }: RecipeModalProps) {
  const navigate = useNavigate();
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
  } = useRecipeEditing(recipe);

  const handleDeleteWithClose = () => {
    handleDelete(() => {
      onClose();
      navigate({ to: "/" });
    });
  };

  const handleShare = async () => {
    try {
      const response = await fetch('/api/share-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeId: currentRecipe.id }),
      });

      const data = await response.json();

      if (data.success) {
        // Copy to clipboard
        await navigator.clipboard.writeText(data.shareUrl);
        
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 z-50 bg-green-50 border border-green-500 text-green-900 px-4 py-2 rounded-md shadow-lg transition-all';
        toast.textContent = 'Share link copied to clipboard!';
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 3000);
      } else {
        // Error toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 z-50 bg-red-50 border border-red-500 text-red-900 px-4 py-2 rounded-md shadow-lg transition-all';
        toast.textContent = 'Failed to generate share link';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Error sharing recipe:', error);
      // Error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 z-50 bg-red-50 border border-red-500 text-red-900 px-4 py-2 rounded-md shadow-lg transition-all';
      toast.textContent = 'Failed to generate share link';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 3000);
    }
  };

  const handleModalClose = () => {
    // Exit editing mode when modal closes
    if (isEditing) {
      handleCancelEdit();
    }
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center">
              <DialogTitle className="text-2xl font-bold text-gradient-dark flex-1">
                {isEditing ? (
                  <Input
                    value={editedRecipe.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="text-2xl font-bold"
                  />
                ) : (
                  currentRecipe.title
                )}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={handleEdit}>
                        <EditIcon className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleShare}>
                        <ShareIcon className="h-4 w-4 mr-2" />
                        Share This Recipe
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDeleteWithClose}
                        className="text-red-600"
                        disabled={deleteRecipeMutation.isPending}
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        {deleteRecipeMutation.isPending
                          ? "Deleting..."
                          : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <DialogClose asChild>
                  <Button variant="ghost" size="sm">
                    <XIcon className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogHeader>

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
                    value={editedRecipe.description || ""}
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

            <div className="flex flex-col gap-2 mb-3">
              <div className="bg-[#eff6ff] flex justify-between rounded-xl p-3 w-full">
                <p className="text-[#88a3eb] font-semibold text-lg">
                  🍽️ Cuisine
                </p>
                {isEditing ? (
                  <Input
                    value={editedRecipe.cuisine || ""}
                    onChange={(e) =>
                      handleInputChange("cuisine", e.target.value)
                    }
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
                      value={editedRecipe.prepTime || ""}
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
                      value={editedRecipe.cookTime || ""}
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
                  <p className="text-[#7e22ce] font-semibold text-lg">
                    Servings
                  </p>
                </div>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedRecipe.servings || ""}
                    onChange={(e) =>
                      handleInputChange("servings", e.target.value)
                    }
                    placeholder="4"
                    className="max-w-[80px] text-right"
                  />
                ) : (
                  <p className="italic font-semibold text-lg">
                    {scaleServings(currentRecipe.servings, ingredientScale) || "No info"}
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
                    {editedRecipe.tags?.map((tag, index) => (
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
              className="flex  flex-col gap-2"
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
                    {editedRecipe.instructions.map((instruction, index) => (
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
                  value={editedRecipe.sourceUrl}
                  onChange={(e) =>
                    handleInputChange("sourceUrl", e.target.value)
                  }
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
        </DialogContent>
      </Dialog>

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
    </>
  );
}
