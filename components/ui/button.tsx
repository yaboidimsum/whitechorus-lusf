import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-xs font-bold tracking-normal transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "border border-cream/20 bg-cream text-plum-deep shadow-sm hover:bg-cream/90 focus-visible:ring-cream/40",
        coral:
          "bg-coral text-plum-deep shadow-[0_4px_16px_rgba(255,154,131,0.3)] hover:bg-coral/95 hover:shadow-[0_6px_22px_rgba(255,154,131,0.45)] focus-visible:ring-coral/40",
        outline:
          "border border-cream/20 bg-plum/60 text-cream shadow-sm backdrop-blur-md hover:border-cream/40 hover:bg-plum/90 focus-visible:ring-cream/30",
        activeOutline:
          "border-coral bg-coral text-plum-deep shadow-[0_4px_16px_rgba(255,154,131,0.3)]",
        secondary:
          "border border-cream/20 bg-plum/70 text-cream shadow-sm backdrop-blur-md hover:border-cream/40 hover:bg-plum/90 focus-visible:ring-cream/30",
        destructive:
          "border border-pink-neon/30 bg-plum/60 text-pink-neon shadow-sm backdrop-blur-md hover:bg-pink-neon/15 hover:border-pink-neon/50 focus-visible:ring-pink-neon/30",
        ghost:
          "rounded-xl text-cream/80 hover:text-cream hover:bg-cream/10",
      },
      size: {
        default: "min-h-[44px] px-4 py-2.5 text-xs font-bold",
        sm: "min-h-[36px] px-3 py-1.5 text-xs font-semibold",
        lg: "min-h-[48px] px-5 py-3 text-xs sm:text-sm font-bold tracking-normal",
        icon: "size-10 rounded-2xl p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
