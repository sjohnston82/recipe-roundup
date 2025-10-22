import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Types
interface Recipe {
  tags: string[] | null;
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  ingredients: string[];
  instructions: string[];
  cuisine: string | null;
  prepTime: string | null;
  cookTime: string | null;
  servings: string | null;
  createdAt: string;
  sourceUrl: string;
  rating: number | null;
  lastMadeAt: string | null;
  notes: RecipeNote[];
  nutrition?: {
    calories?: string;
    protein?: string;
    totalFat?: string;
    saturatedFat?: string;
    transFat?: string;
    fiber?: string;
    sugar?: string;
    sodium?: string;
  } | null;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface RecipesResponse {
  recipes: Recipe[];
  pagination: PaginationInfo;
}

interface RecipeNote {
  id: string;
  content: string;
  createdAt: string;
  recipeId: string;
  userId?: string;
}

interface CreateRecipeData {
  title: string;
  description?: string | null;
  sourceUrl: string;
  cuisine?: string | null;
  prepTime?: string | null;
  cookTime?: string | null;
  servings?: string | null;
  ingredients: string[];
  instructions: string[];
  tags?: string[] | null;
  imageUrl?: string | null;
  rating?: number | null;
  nutrition?: {
    calories?: string;
    protein?: string;
    totalFat?: string;
    saturatedFat?: string;
    transFat?: string;
    fiber?: string;
    sugar?: string;
    sodium?: string;
  } | null;
}

interface UpdateRecipeData extends CreateRecipeData {
  id: string;
  lastMadeAt?: string | null;
}

interface Tag {
  tag: string;
  count: number;
}

// API functions
const fetchRecipes = async (
  page: number = 1,
  limit: number = 10
): Promise<RecipesResponse> => {
  const response = await fetch(`/api/recipes?page=${page}&limit=${limit}`);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch recipes");
  }

  return {
    recipes: result.recipes,
    pagination: result.pagination,
  };
};

const fetchTags = async (): Promise<Tag[]> => {
  const response = await fetch("/api/recipes?type=tags");
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch tags");
  }

  return result.tags;
};

const createRecipe = async (data: CreateRecipeData): Promise<Recipe> => {
  const response = await fetch("/api/recipes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to create recipe");
  }

  return result.recipe;
};

const updateRecipe = async (data: UpdateRecipeData): Promise<Recipe> => {
  const response = await fetch("/api/recipes", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update recipe");
  }

  return result.recipe;
};

const deleteRecipe = async (id: string): Promise<void> => {
  const response = await fetch(`/api/recipes?id=${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete recipe");
  }
};

// Recipe Notes API functions
const createRecipeNote = async (data: {
  recipeId: string;
  content: string;
}): Promise<RecipeNote> => {
  const response = await fetch("/api/recipe-notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to create note");
  }

  return result.note;
};

const deleteRecipeNote = async (id: string): Promise<void> => {
  const response = await fetch(`/api/recipe-notes?id=${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete note");
  }
};

// Query keys
export const queryKeys = {
  recipes: (page?: number, limit?: number) => ["recipes", page, limit] as const,
  recipe: (id: string) => ["recipes", id] as const,
  tags: ["tags"] as const,
};

// Hooks
export const useRecipes = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: queryKeys.recipes(page, limit),
    queryFn: () => fetchRecipes(page, limit),
  });
};

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecipe,
    onSuccess: (newRecipe) => {
      // Invalidate and refetch recipes
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast.success("Recipe created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create recipe");
    },
  });
};

export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRecipe,
    onSuccess: (updatedRecipe) => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast.success("Recipe updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update recipe");
    },
  });
};

export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecipe,
    onSuccess: (_, deletedId) => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast.success("Recipe deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete recipe");
    },
  });
};

// Recipe Notes hooks
export const useCreateRecipeNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecipeNote,
    onSuccess: (newNote) => {
      // Invalidate recipes to refetch with updated notes
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast.success("Note added successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add note");
    },
  });
};

export const useDeleteRecipeNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecipeNote,
    onSuccess: () => {
      // Invalidate recipes to refetch with updated notes
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast.success("Note deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete note");
    },
  });
};

export const useTags = () => {
  return useQuery({
    queryKey: queryKeys.tags,
    queryFn: fetchTags,
  });
};

// Profile update mutation
export const useUpdateProfile = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; image: string }) => {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all queries to refresh any cached data
      queryClient.invalidateQueries();
      toast.success("Profile updated successfully!");
      
      // Call the optional onSuccess callback
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
};

// Export types for use in components
export type {
  Recipe,
  RecipeNote,
  CreateRecipeData,
  UpdateRecipeData,
  Tag,
  PaginationInfo,
  RecipesResponse,
};
