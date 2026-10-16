import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-900 text-white",
        luxury:
          "bg-zinc-100 text-zinc-800 border border-zinc-200/80 shadow-xs",
        secondary:
          "bg-zinc-100 text-zinc-700",
        outline:
          "border border-zinc-300 text-zinc-800",
        success:
          "bg-emerald-50 text-emerald-700 border border-emerald-200",
        destructive:
          "bg-red-50 text-red-700 border border-red-200",
        glass:
          "bg-white/80 backdrop-blur-md text-zinc-900 border border-white/40 shadow-xs",
      },
      size: {
        sm: "px-2.5 py-0.5 text-[11px]",
        default: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: string;
}

export function Badge({
  className,
  variant,
  size,
  dot = false,
  dotColor,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "size-1.5 rounded-full",
            dotColor ||
              (variant === "success"
                ? "bg-emerald-500"
                : variant === "destructive"
                ? "bg-red-500"
                : "bg-zinc-900")
          )}
        />
      )}
      {children}
    </div>
  );
}
