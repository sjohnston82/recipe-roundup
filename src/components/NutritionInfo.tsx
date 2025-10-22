// src/components/NutritionInfo.tsx
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface NutritionData {
  calories?: string;
  protein?: string;
  totalFat?: string;
  saturatedFat?: string;
  transFat?: string;
  fiber?: string;
  sugar?: string;
  sodium?: string;
}

interface NutritionInfoProps {
  nutrition: NutritionData | null;
  isEditing?: boolean;
  onNutritionChange?: (nutrition: NutritionData) => void;
}

export function NutritionInfo({
  nutrition,
  isEditing,
  onNutritionChange,
}: NutritionInfoProps) {
  const handleInputChange = (field: keyof NutritionData, value: string) => {
    if (!onNutritionChange) return;
    onNutritionChange({
      ...nutrition,
      [field]: value,
    });
  };

  if (!nutrition && !isEditing) {
    return (
      <p className="text-muted-text mt-2 italic">
        There is no nutritional information saved for this recipe.
      </p>
    );
  }

  if (isEditing) {
    return (
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium text-muted-text">
              Calories
            </Label>
            <Input
              value={nutrition?.calories || ""}
              onChange={(e) => handleInputChange("calories", e.target.value)}
              placeholder="250"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-text">
              Protein (g)
            </Label>
            <Input
              value={nutrition?.protein || ""}
              onChange={(e) => handleInputChange("protein", e.target.value)}
              placeholder="15g"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-text">
              Total Fat (g)
            </Label>
            <Input
              value={nutrition?.totalFat || ""}
              onChange={(e) => handleInputChange("totalFat", e.target.value)}
              placeholder="10g"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-text">
              Saturated Fat (g)
            </Label>
            <Input
              value={nutrition?.saturatedFat || ""}
              onChange={(e) =>
                handleInputChange("saturatedFat", e.target.value)
              }
              placeholder="3g"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-text">
              Trans Fat (g)
            </Label>
            <Input
              value={nutrition?.transFat || ""}
              onChange={(e) => handleInputChange("transFat", e.target.value)}
              placeholder="0g"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-text">
              Dietary Fiber (g)
            </Label>
            <Input
              value={nutrition?.fiber || ""}
              onChange={(e) => handleInputChange("fiber", e.target.value)}
              placeholder="5g"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-text">
              Total Sugar (g)
            </Label>
            <Input
              value={nutrition?.sugar || ""}
              onChange={(e) => handleInputChange("sugar", e.target.value)}
              placeholder="8g"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-text">
              Sodium (mg)
            </Label>
            <Input
              value={nutrition?.sodium || ""}
              onChange={(e) => handleInputChange("sodium", e.target.value)}
              placeholder="300mg"
              className="mt-1"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {nutrition?.calories && (
            <div className="text-center">
              <div className="font-semibold text-lg text-gradient-dark">
                {nutrition.calories}
              </div>
              <div className="text-muted-text">Calories</div>
            </div>
          )}
          {nutrition?.protein && (
            <div className="text-center">
              <div className="font-semibold text-lg text-gradient-dark">
                {nutrition.protein}
              </div>
              <div className="text-muted-text">Protein</div>
            </div>
          )}
          {nutrition?.totalFat && (
            <div className="text-center">
              <div className="font-semibold text-lg text-gradient-dark">
                {nutrition.totalFat}
              </div>
              <div className="text-muted-text">Total Fat</div>
            </div>
          )}
          {nutrition?.fiber && (
            <div className="text-center">
              <div className="font-semibold text-lg text-gradient-dark">
                {nutrition.fiber}
              </div>
              <div className="text-muted-text">Fiber</div>
            </div>
          )}
          {nutrition?.saturatedFat && (
            <div className="text-center">
              <div className="font-semibold text-lg text-gradient-dark">
                {nutrition.saturatedFat}
              </div>
              <div className="text-muted-text">Saturated Fat</div>
            </div>
          )}
          {nutrition?.transFat && (
            <div className="text-center">
              <div className="font-semibold text-lg text-gradient-dark">
                {nutrition.transFat}
              </div>
              <div className="text-muted-text">Trans Fat</div>
            </div>
          )}
          {nutrition?.sugar && (
            <div className="text-center">
              <div className="font-semibold text-lg text-gradient-dark">
                {nutrition.sugar}
              </div>
              <div className="text-muted-text">Sugar</div>
            </div>
          )}
          {nutrition?.sodium && (
            <div className="text-center">
              <div className="font-semibold text-lg text-gradient-dark">
                {nutrition.sodium}
              </div>
              <div className="text-muted-text">Sodium</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
