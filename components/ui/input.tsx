import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-2xl border border-cream/20 bg-plum/40 px-3.5 py-2 text-base sm:text-sm text-cream placeholder:text-cream/40 backdrop-blur-md transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:border-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/30 disabled:cursor-not-allowed disabled:opacity-50 [touch-action:manipulation]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
