import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { TagInput } from "./TagsInput";
import { useCreateRecipe, type CreateRecipeData } from "../lib/api-hooks";
import { useNavigate } from "@tanstack/react-router";
import { NutritionInfo } from "./NutritionInfo";

// Zod schema for recipe validation
const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  sourceUrl: z.string().url("Must be a valid URL"),
  cuisine: z.string().optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  servings: z.string().optional(),
  ingredients: z.array(z.string().optional()),
  instructions: z.array(z.string().optional()),
  tags: z.array(z.string().optional()),
  imageUrl: z.string().optional(),
  nutrition: z
    .object({
      calories: z.string().optional(),
      protein: z.string().optional(),
      totalFat: z.string().optional(),
      saturatedFat: z.string().optional(),
      transFat: z.string().optional(),
      fiber: z.string().optional(),
      sugar: z.string().optional(),
      sodium: z.string().optional(),
    })
    .optional(),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

interface ScrapedRecipeFormProps {
  scrapedData: Partial<RecipeFormData>;
  onCancel: () => void;
}

const allFields = {
  title: "Recipe Title",
  description: "Description",
  sourceUrl: "Source URL",
  cuisine: "Cuisine",
  prepTime: "Prep Time (minutes)",
  cookTime: "Cook Time (minutes)",
  servings: "Servings",
  ingredients: "Ingredients",
  instructions: "Instructions",
  imageUrl: "Image URL",
  nutrition: "Nutrition Information",
};

export function ScrapedRecipeForm({
  scrapedData,
  onCancel,
}: ScrapedRecipeFormProps) {
  const navigate = useNavigate();
  const createRecipeMutation = useCreateRecipe();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      ...scrapedData,
      ingredients: scrapedData.ingredients?.length
        ? scrapedData.ingredients
        : [""],
      instructions: scrapedData.instructions?.length
        ? scrapedData.instructions
        : [""],
      tags: scrapedData.tags || [],
    },
  });

  const ingredients = watch("ingredients");
  const instructions = watch("instructions");
  const tags = watch("tags");
  const nutrition = watch("nutrition");

  const filledFields = Object.keys(scrapedData).filter(
    (key) =>
      scrapedData[key as keyof RecipeFormData] &&
      (Array.isArray(scrapedData[key as keyof RecipeFormData])
        ? (scrapedData[key as keyof RecipeFormData] as any[]).length > 0
        : true)
  );

  const missingFields = Object.keys(allFields).filter(
    (key) => !filledFields.includes(key)
  ) as (keyof typeof allFields)[];

  const renderTextField = (
    fieldName: keyof RecipeFormData,
    label: string,
    isRequired = false,
    isTextArea = false
  ) => {
    const Component = isTextArea ? "textarea" : Input;
    return (
      <div>
        <Label
          htmlFor={fieldName}
          className="block text-sm font-medium text-muted-text mb-2"
        >
          {label} {isRequired && "*"}
        </Label>
        <Component
          id={fieldName}
          {...register(fieldName as any)}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="w-full"
        />
        {errors[fieldName] && (
          <span className="text-sm text-danger mt-1 block">
            {(errors[fieldName] as any)?.message}
          </span>
        )}
      </div>
    );
  };

  const addIngredient = () => {
    setValue("ingredients", [...(ingredients || []), ""]);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = ingredients?.filter((_, i) => i !== index) || [];
    setValue("ingredients", newIngredients);
  };

  const addInstruction = () => {
    setValue("instructions", [...(instructions || []), ""]);
  };

  const removeInstruction = (index: number) => {
    const newInstructions = instructions?.filter((_, i) => i !== index) || [];
    setValue("instructions", newInstructions);
  };

  const handleNutritionChange = (nutritionData: any) => {
    setValue("nutrition", nutritionData);
  };

  const onSubmit = (data: RecipeFormData) => {
    const tags = data.tags
      ? data.tags
          .filter((t): t is string => !!t && t.trim() !== "")
          .map((t) => t.trim())
      : [];
    const instructions = data.instructions
      ? data.instructions
          .filter((t): t is string => !!t && t.trim() !== "")
          .map((t) => t.trim())
      : [];
    const ingredients = data.ingredients
      ? data.ingredients
          .filter((t): t is string => !!t && t.trim() !== "")
          .map((t) => t.trim())
      : [];

    const recipeData: CreateRecipeData = {
      ...data,
      ingredients: ingredients,
      instructions: instructions,
      description: data.description || null,
      cuisine: data.cuisine || null,
      prepTime: data.prepTime || null,
      cookTime: data.cookTime || null,
      servings: data.servings || null,
      tags: tags,
      imageUrl: data.imageUrl || null,
      nutrition:
        data.nutrition && Object.values(data.nutrition).some((v) => v?.trim())
          ? data.nutrition
          : null,
    };

    createRecipeMutation.mutate(recipeData, {
      onSuccess: () => {
        navigate({ to: "/" });
      },
    });
  };

  const filteredTags =
    tags?.filter((t): t is string => !!t && t.trim() !== "") || [];

  const renderField = (field: keyof typeof allFields) => {
    switch (field) {
      case "title":
        return renderTextField("title", "Recipe Title", true);
      case "description":
        return renderTextField("description", "Description", false, true);
      case "sourceUrl":
        return renderTextField("sourceUrl", "Source URL", true);
      case "cuisine":
        return renderTextField("cuisine", "Cuisine");
      case "prepTime":
        return renderTextField("prepTime", "Prep Time (minutes)");
      case "cookTime":
        return renderTextField("cookTime", "Cook Time (minutes)");
      case "servings":
        return renderTextField("servings", "Servings");
      case "imageUrl":
        return renderTextField("imageUrl", "Image URL");
      case "ingredients":
        return (
          <div className="space-y-4">
            <Label className="block text-lg font-semibold text-gradient-dark">
              Ingredients
            </Label>
            <div className="space-y-3">
              {ingredients?.map((_, index) => (
                <div key={index} className="flex gap-3">
                  <Input
                    {...register(`ingredients.${index}` as const)}
                    placeholder={`Ingredient ${index + 1}`}
                    className="flex-1"
                  />
                  {ingredients.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="bg-danger-red hover:bg-red-600 px-4"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                onClick={addIngredient}
                className="bg-success-green hover:bg-green-600 w-fit"
              >
                Add Ingredient
              </Button>
            </div>
          </div>
        );
      case "instructions":
        return (
          <div className="space-y-4">
            <Label className="block text-lg font-semibold text-gradient-dark">
              Instructions
            </Label>
            <div className="space-y-3">
              {instructions?.map((_, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <Label className="block text-sm font-medium text-muted-text mb-1">
                      Step {index + 1}
                    </Label>
                    <textarea
                      {...register(`instructions.${index}` as const)}
                      placeholder={`Describe step ${index + 1}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none min-h-[80px] focus:ring-2 focus:ring-gradient-light focus:border-transparent"
                    />
                  </div>
                  {instructions.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="bg-danger hover:bg-red-600 px-4 h-fit mt-6"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                onClick={addInstruction}
                className="bg-success-green hover:bg-green-600 w-fit"
              >
                Add Instruction
              </Button>
            </div>
          </div>
        );
      case "nutrition":
        return (
          <div className="space-y-4">
            <Label className="block text-lg font-semibold text-gradient-dark">
              Nutrition Information
            </Label>
            <NutritionInfo
              nutrition={nutrition || null}
              isEditing={true}
              onNutritionChange={handleNutritionChange}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Filled Fields */}
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-gradient-dark border-b pb-2">
          Scraped Recipe Data
        </h3>
        <p className="text-muted-text">
          We've pre-filled the form with the data we could find. Please review
          and edit as needed.
        </p>

        {filledFields.map((field) => (
          <div key={field}>{renderField(field as keyof typeof allFields)}</div>
        ))}
      </div>

      {/* Missing Fields */}
      {missingFields.length > 0 && (
        <div className="space-y-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-2xl font-semibold text-yellow-800 border-b border-yellow-300 pb-2">
            Missing Information
          </h3>
          <p className="text-yellow-700">
            We couldn't find the following information. Please fill in the
            missing fields.
          </p>
          {missingFields.map((field) => (
            <div key={field}>{renderField(field)}</div>
          ))}
        </div>
      )}

      {/* Tags */}
      <div className="space-y-4">
        <Label className="block text-lg font-semibold text-gradient-dark">
          Tags
        </Label>
        <TagInput
          tags={filteredTags}
          onChange={(updatedTags) => {
            setValue("tags", updatedTags);
          }}
        />
      </div>

      {/* Submit buttons */}
      <div className="flex gap-4 pt-6 border-t">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-muted-text text-muted-text hover:bg-gray-100"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createRecipeMutation.isPending}
          className="flex-1 bg-gradient-to-r from-gradient-dark to-gradient-light hover:opacity-90 text-lg py-3"
        >
          {createRecipeMutation.isPending ? "Saving..." : "Save Recipe"}
        </Button>
      </div>
    </form>
  );
}
