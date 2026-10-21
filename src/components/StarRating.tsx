"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";

interface StarRatingProps {
  rating: number | null | undefined;
  onChange?: (rating: number | null) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export function StarRating({
  rating,
  onChange,
  readOnly = false,
  size = "md",
  showValue = true,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }[size];

  const containerSizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }[size];

  const currentVal = hoverRating !== null ? hoverRating : rating || 0;

  function handleClick(val: number) {
    if (readOnly || !onChange) return;
    // Clicking the same rating resets to null (clears rating)
    if (rating === val) {
      onChange(null);
    } else {
      onChange(val);
    }
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    if (readOnly || !onChange) return;
    onChange(null);
  }

  return (
    <div
      className="inline-flex items-center gap-2 select-none"
      onMouseLeave={() => !readOnly && setHoverRating(null)}
    >
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFull = currentVal >= starIndex;
          const isHalf = !isFull && currentVal >= starIndex - 0.5;

          return (
            <div
              key={starIndex}
              className={`relative ${containerSizeClasses} flex items-center justify-center`}
            >
              {/* Background Empty Star */}
              <Star
                className={`${starSizeClasses} text-slate-700/80 transition-colors`}
              />

              {/* Full Star Overlay */}
              {isFull && (
                <Star
                  className={`${starSizeClasses} fill-amber-400 text-amber-400 absolute top-0 left-0 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] pointer-events-none`}
                />
              )}

              {/* Half Star Overlay */}
              {isHalf && (
                <div className="absolute top-0 left-0 w-[50%] h-full overflow-hidden pointer-events-none">
                  <Star
                    className={`${starSizeClasses} fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] shrink-0`}
                  />
                </div>
              )}

              {/* Interactive Hit Areas (Left Half and Right Half) */}
              {!readOnly && (
                <>
                  <button
                    type="button"
                    aria-label={`Avaliar ${starIndex - 0.5} estrelas`}
                    onMouseEnter={() => setHoverRating(starIndex - 0.5)}
                    onClick={() => handleClick(starIndex - 0.5)}
                    className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label={`Avaliar ${starIndex} estrelas`}
                    onMouseEnter={() => setHoverRating(starIndex)}
                    onClick={() => handleClick(starIndex)}
                    className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer focus:outline-none"
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Numeric value / helper */}
      {showValue && (
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {currentVal > 0 ? (
            <>
              <span className="text-amber-400 font-bold">
                {currentVal.toFixed(1).replace(".0", "")}
              </span>
              <span className="text-slate-500 font-normal">/ 5</span>

              {!readOnly && onChange && rating !== null && rating !== undefined && (
                <button
                  type="button"
                  onClick={handleClear}
                  title="Remover avaliação"
                  className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </>
          ) : (
            !readOnly && (
              <span className="text-slate-500 font-normal text-[11px]">
                Toque para avaliar
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
}
