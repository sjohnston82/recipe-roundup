import { useState } from "react";
import { Star, StarIcon } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleStarClick = (starRating: number) => {
    if (readonly || !onRatingChange) return;
    onRatingChange(starRating);
  };

  const handleStarHover = (starRating: number) => {
    if (readonly) return;
    setHoverRating(starRating);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };

  const getStarFill = (starIndex: number) => {
    const currentRating = hoverRating || rating;
    const starValue = starIndex + 1;

    if (currentRating >= starValue) {
      return "fill-yellow-400 text-yellow-400";
    } else if (currentRating >= starValue - 0.5) {
      return "fill-yellow-400/50 text-yellow-400";
    } else {
      return "fill-gray-200 text-gray-200";
    }
  };

  return (
    <div className="flex items-center gap-1" onMouseLeave={handleMouseLeave}>
      {[0, 1, 2, 3, 4].map((starIndex) => (
        <div key={starIndex} className="relative">
          <StarIcon
            className={`${sizeClasses[size]} ${getStarFill(starIndex)} ${
              readonly ? "cursor-default" : "cursor-pointer"
            } transition-colors duration-150`}
            onClick={() => handleStarClick(starIndex + 1)}
            onMouseEnter={() => handleStarHover(starIndex + 1)}
          />
          {/* Half star overlay for half-star ratings */}
          {!readonly && (
            <Star
              className={`${sizeClasses[size]} absolute top-0 left-0 cursor-pointer transition-colors duration-150 overflow-hidden`}
              style={{
                width: "50%",
                clipPath: "inset(0 50% 0 0)",
                fill:
                  hoverRating >= starIndex + 0.5 ||
                  (!hoverRating && rating >= starIndex + 0.5)
                    ? "#facc15"
                    : "transparent",
              }}
              onClick={() => handleStarClick(starIndex + 0.5)}
              onMouseEnter={() => handleStarHover(starIndex + 0.5)}
            />
          )}
        </div>
      ))}
      {rating > 0 && (
        <span className="text-sm text-gray-600 ml-1">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
}
