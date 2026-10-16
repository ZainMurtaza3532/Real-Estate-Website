"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 hover:shadow-md",
        luxury:
          "bg-zinc-900 text-white font-medium hover:bg-zinc-800 shadow-sm",
        white:
          "bg-white text-zinc-900 hover:bg-zinc-100 shadow-sm font-medium",
        secondary:
          "bg-zinc-100 text-zinc-800 hover:bg-zinc-200",
        outline:
          "border border-zinc-200 bg-transparent text-zinc-800 hover:bg-zinc-100 hover:text-zinc-900",
        ghost:
          "hover:bg-zinc-100 hover:text-zinc-900",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        glass:
          "bg-white/90 backdrop-blur-md border border-white/30 text-zinc-900 hover:bg-white shadow-sm",
        link:
          "text-zinc-900 underline-offset-4 hover:underline !p-0 !h-auto",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-6 text-sm font-medium",
        icon: "h-10 w-10 p-0 rounded-xl",
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
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
