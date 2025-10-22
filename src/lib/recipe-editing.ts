import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import {
  useUpdateRecipe,
  useDeleteRecipe,
  useCreateRecipeNote,
  type Recipe,
} from "./api-hooks";

export function useRecipeEditing(recipe: Recipe) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState<Recipe>(recipe);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(recipe.rating || 0);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [isShowingIngredients, setIsShowingIngredients] = useState(false);
  const [isShowingInstructions, setIsShowingInstructions] = useState(false);
  const [isShowingNutrition, setIsShowingNutrition] = useState(false);
  const [ingredientScale, setIngredientScale] = useState(1);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  
  const navigate = useNavigate();
  const updateRecipeMutation = useUpdateRecipe();
  const deleteRecipeMutation = useDeleteRecipe();
  const createNoteMutation = useCreateRecipeNote();

  useEffect(() => {
    setEditedRecipe(recipe);
    setFeedbackRating(recipe.rating || 0);
  }, [recipe]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedRecipe({ ...recipe });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedRecipe(recipe);
  };

  const handleSave = () => {
    updateRecipeMutation.mutate(editedRecipe, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const handleDelete = (onSuccess?: () => void) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      deleteRecipeMutation.mutate(recipe.id, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
    }
  };

  const handleInputChange = (field: keyof Recipe, value: any) => {
    setEditedRecipe((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (
    field: "ingredients" | "instructions" | "tags",
    index: number,
    value: string
  ) => {
    setEditedRecipe((prev) => ({
      ...prev,
      [field]:
        prev[field]?.map((item, i) => (i === index ? value : item)) || [],
    }));
  };

  const addArrayItem = (field: "ingredients" | "instructions" | "tags") => {
    setEditedRecipe((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ""],
    }));
  };

  const removeArrayItem = (
    field: "ingredients" | "instructions" | "tags",
    index: number
  ) => {
    setEditedRecipe((prev) => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleMadeToday = () => {
    const currentRecipe = isEditing ? editedRecipe : recipe;
    updateRecipeMutation.mutate(
      {
        ...currentRecipe,
        lastMadeAt: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          setShowFeedbackModal(true);
          toast.success("Marked as made today!");
        },
      }
    );
  };

  const handleFeedbackSubmit = () => {
    const currentRecipe = isEditing ? editedRecipe : recipe;
    const updates: Partial<Recipe> = {};

    if (feedbackRating !== currentRecipe.rating) {
      updates.rating = feedbackRating;
    }

    if (feedbackNote.trim()) {
      createNoteMutation.mutate(
        {
          recipeId: recipe.id,
          content: feedbackNote.trim(),
        },
        {
          onSuccess: () => {
            setFeedbackNote("");
          },
        }
      );
    }

    if (Object.keys(updates).length > 0) {
      updateRecipeMutation.mutate({
        ...currentRecipe,
        ...updates,
      });
    }

    setShowFeedbackModal(false);
    setFeedbackNote("");
    toast.success("Thank you for your feedback!");
  };

  const handleNutritionChange = (nutrition: any) => {
    setEditedRecipe((prev) => ({
      ...prev,
      nutrition,
    }));
  };

  const formatLastMade = (dateString: string | null) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    const now = new Date();
    const diffInHours =
      Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return "Today";
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const toggleIngredientCheck = (index: number) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const currentRecipe = isEditing ? editedRecipe : recipe;

  return {
    // State
    isEditing,
    editedRecipe,
    showFeedbackModal,
    feedbackRating,
    feedbackNote,
    isShowingIngredients,
    isShowingInstructions,
    isShowingNutrition,
    ingredientScale,
    checkedIngredients,
    currentRecipe,
    
    // Mutations
    updateRecipeMutation,
    deleteRecipeMutation,
    createNoteMutation,
    
    // Handlers
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
    
    // Setters
    setShowFeedbackModal,
    setFeedbackRating,
    setFeedbackNote,
    setIsShowingIngredients,
    setIsShowingInstructions,
    setIsShowingNutrition,
    setIngredientScale,
  };
}
