import { useState } from "react";
import { Check, Circle, Dot } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CareerPlan, PathStep } from "@/lib/skillmaps-store";

const LABEL: Record<PathStep["status"], string> = {
  completed: "Completed",
  current: "Current",
  next: "Next",
  upcoming: "Upcoming",
};

export function LearningPath({ plan }: { plan: CareerPlan }) {
  const [openStep, setOpenStep] = useState<PathStep | null>(null);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold text-muted-foreground">Learning path</h2>

      <ol className="mt-4 space-y-1">
        {plan.steps.map((step) => (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => setOpenStep(step)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-secondary"
            >
              {step.status === "completed" ? (
                <Check className="size-4 shrink-0 text-success" />
              ) : step.status === "current" ? (
                <Dot className="size-4 shrink-0 text-primary" />
              ) : (
                <Circle className="size-3.5 shrink-0 text-muted-foreground" />
              )}
              <span
                className={
                  step.status === "current"
                    ? "flex-1 text-sm font-semibold"
                    : step.status === "completed"
                      ? "flex-1 text-sm text-muted-foreground line-through"
                      : "flex-1 text-sm"
                }
              >
                {step.title}
              </span>
              <span className="text-xs text-muted-foreground">{LABEL[step.status]}</span>
            </button>
          </li>
        ))}
      </ol>

      <Dialog open={Boolean(openStep)} onOpenChange={(o) => !o && setOpenStep(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{openStep?.title}</DialogTitle>
            <DialogDescription>{openStep?.focus}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">{openStep?.why}</p>
            <p>
              <span className="text-muted-foreground">Done when: </span>
              {openStep?.outcome}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
