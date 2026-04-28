import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

// SMARTHIRE wordmark: letters black, H and R in brand crimson.
export function Logo({ className, size = "md" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="SMARTHIRE - home"
      className="inline-flex items-center transition-opacity hover:opacity-80"
    >
      <span
        aria-hidden="true"
        className={cn(
          "font-heading text-primary inline-flex font-bold tracking-tight",
          sizeMap[size],
          className,
        )}
      >
        <span>SMART</span>
        <span className="text-brand">H</span>
        <span>I</span>
        <span className="text-brand">R</span>
        <span>E</span>
      </span>
    </Link>
  );
}
