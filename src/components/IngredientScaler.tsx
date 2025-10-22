import { useState } from "react";
import { Button } from "./ui/button";

interface IngredientScalerProps {
  onScaleChange: (scale: number) => void;
  currentScale: number;
}

export function IngredientScaler({ onScaleChange, currentScale }: IngredientScalerProps) {
  const scales = [
    { value: 1, label: "1X" },
    { value: 2, label: "2X" },
    { value: 3, label: "3X" },
  ];

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm font-medium text-gray-700 mr-2">Scale:</span>
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {scales.map((scale) => (
          <Button
            key={scale.value}
            onClick={() => onScaleChange(scale.value)}
            variant={currentScale === scale.value ? "default" : "ghost"}
            size="sm"
            className={`px-3 py-1 text-sm font-medium transition-all ${
              currentScale === scale.value
                ? "bg-gradient-to-r from-gradient-dark to-gradient-light text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            {scale.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
