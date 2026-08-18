"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select option...",
  className,
  id,
  "aria-label": ariaLabel,
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const selectedOption = options.find((o) => o.value === value);

  // Close on outside click
  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleOutside);
      return () => document.removeEventListener("mousedown", handleOutside);
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((prev) => !prev);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        const currIdx = options.findIndex((o) => o.value === value);
        const nextIdx = Math.min(options.length - 1, currIdx + 1);
        onChange(options[nextIdx].value);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (open) {
        const currIdx = options.findIndex((o) => o.value === value);
        const prevIdx = Math.max(0, currIdx - 1);
        onChange(options[prevIdx].value);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative min-w-[180px]", open ? "z-50" : "z-10", className)}
    >
      <button
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-2xl border border-cream/20 bg-plum/60 px-3.5 py-2 text-xs font-bold text-cream shadow-sm backdrop-blur-md transition-all hover:border-cream/40 hover:bg-plum/90 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30",
          open && "border-coral ring-2 ring-coral/30"
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-cream/60 transition-transform duration-200",
            open && "rotate-180 text-coral"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            key="select-dropdown-list"
            role="listbox"
            tabIndex={-1}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[70] mt-1.5 max-h-60 w-full overflow-y-auto rounded-2xl border border-cream/20 bg-plum-deep p-1 shadow-2xl backdrop-blur-2xl"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-cream/80 transition-colors hover:bg-cream/10 hover:text-cream",
                    isSelected && "bg-coral/15 text-coral"
                  )}
                >
                  <span className="flex items-center gap-2 truncate">
                    {option.icon}
                    {option.label}
                  </span>
                  {isSelected && <Check className="size-3.5 text-coral" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
