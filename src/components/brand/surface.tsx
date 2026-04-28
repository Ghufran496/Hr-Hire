import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type SurfaceProps = {
  as?: ElementType;
  variant?: "default" | "muted";
  hoverable?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Canonical card surface from `design-system/smarthire/MASTER.md`.
 * Use this anywhere we'd otherwise repeat
 *   `bg-card border border-border rounded-xl p-6`.
 */
export function Surface({
  as,
  variant = "default",
  hoverable = false,
  className,
  children,
}: SurfaceProps) {
  const Tag = as ?? "div";
  return (
    <Tag
      className={cn(
        "border-border rounded-xl border p-6",
        variant === "default" ? "bg-background" : "bg-secondary/30",
        hoverable && "hover:border-foreground/20 transition hover:shadow-md",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
