import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PrimaryAction({
  children,
  onClick,
  className,
  icon,
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "gradient-hot inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function GhostAction({
  children,
  onClick,
  icon,
}: {
  children: ReactNode;
  onClick: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
    >
      {icon}
      {children}
    </button>
  );
}
