export type Nutrition = {
  calories?: string;
  protein?: string;
  totalFat?: string;
  saturatedFat?: string;
  transFat?: string;
  fiber?: string;
  sugar?: string;
  sodium?: string;
} | null;

export type CanonicalIngredient = {
  amount?: number | string;
  unit?: string;
  name: string;
  note?: string;
  display: string;
};

export type RecipeCore = {
  id?: string;
  title: string;
  description?: string | null;
  sourceUrl?: string | null;
  imageUrl?: string | null;
  cuisine?: string | null;
  prepTime?: string | null;
  cookTime?: string | null;
  servings?: string | null;
  ingredients: string[];
  instructions: string[];
  tags?: string[];
  nutrition?: Nutrition;
};

