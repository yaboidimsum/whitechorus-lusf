"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating?: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function StarRating({
  rating = 0,
  onRatingChange,
  readOnly = false,
  size = "md",
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const current = hoverRating !== null ? hoverRating : rating;

  const sizeClasses = {
    sm: "size-3 sm:size-3.5",
    md: "size-4 sm:size-4.5",
    lg: "size-5 sm:size-6",
  };

  const handleRate = (value: number) => {
    if (readOnly || !onRatingChange) return;
    onRatingChange(value);
  };

  const buttonSizeClasses = {
    sm: "size-4 sm:size-4.5 p-0",
    md: "size-7 sm:size-8 p-0.5",
    lg: "size-8 sm:size-9 p-0.5",
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly || !onRatingChange) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(5, (rating || 0) + 1);
      onRatingChange(next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const prev = Math.max(1, (rating || 1) - 1);
      onRatingChange(prev);
    } else if (e.key === "Home") {
      e.preventDefault();
      onRatingChange(1);
    } else if (e.key === "End") {
      e.preventDefault();
      onRatingChange(5);
    }
  };

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role={readOnly ? "img" : "radiogroup"}
      aria-label={`Rating: ${rating} out of 5 stars`}
      onKeyDown={handleKeyDown}
      tabIndex={readOnly ? undefined : 0}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= current;
        const starElement = (
          <Star
            className={cn(
              sizeClasses[size],
              "transition-colors duration-150",
              filled
                ? "fill-coral text-coral drop-shadow-[0_0_6px_rgba(255,154,131,0.5)]"
                : "fill-transparent text-cream/25 hover:text-cream/60"
            )}
          />
        );

        if (readOnly) {
          return (
            <span key={star} className="inline-flex p-0.5">
              {starElement}
            </span>
          );
        }

        return (
          <motion.button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === rating}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.2 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.85 }}
            transition={{ type: "spring", duration: 0.2, bounce: 0.25 }}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(null)}
            className={cn(
              "flex items-center justify-center rounded-full text-cream outline-none transition-transform focus-visible:ring-2 focus-visible:ring-coral/50",
              buttonSizeClasses[size]
            )}
          >
            {starElement}
          </motion.button>
        );
      })}
    </div>
  );
}
