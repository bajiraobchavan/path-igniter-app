import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { buildPlan, type CareerPlan, type PathStep } from "@/lib/skillmaps-store";

type Action =
  | "career"
  | "language"
  | "skip"
  | "add"
  | "remove"
  | "why"
  | "regenerate";

const ACTIONS: Array<{ id: Action; label: string }> = [
  { id: "career", label: "Change career path" },
  { id: "language", label: "Change preferred language" },
  { id: "skip", label: "Skip a learning step" },
  { id: "add", label: "Add a learning step" },
  { id: "remove", label: "Remove a learning step" },
  { id: "why", label: "Ask why something was recommended" },
  { id: "regenerate", label: "Regenerate the learning path" },
];

export function UnderstandMeDialog({
  open,
  onOpenChange,
  plan,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: CareerPlan;
  onChange: (plan: CareerPlan) => void;
}) {
  const [action, setAction] = useState<Action | null>(null);
  const [value, setValue] = useState("");

  const close = () => {
    setAction(null);
    setValue("");
  };

  const advance = (steps: PathStep[]): PathStep[] => {
    const rest = steps.filter((s) => s.status !== "completed");
    return steps.map((s) => {
      if (s.status === "completed") return s;
      const i = rest.indexOf(s);
      return { ...s, status: i === 0 ? "current" : i === 1 ? "next" : "upcoming" };
    });
  };

  const apply = () => {
    if (action === "career" && value.trim()) {
      onChange({ ...buildPlan({ ...plan, career: value.trim() }), goals: plan.goals });
    } else if (action === "language" && value.trim()) {
      onChange({ ...plan, language: value.trim() });
    } else if (action === "add" && value.trim()) {
      onChange({
        ...plan,
        steps: advance([
          ...plan.steps,
          {
            id: `step-${Date.now()}`,
            title: value.trim(),
            status: "upcoming",
            focus: "Added by you",
            why: "You asked for this step.",
            outcome: "Mark it done when it feels solid.",
          },
        ]),
      });
    } else if ((action === "skip" || action === "remove") && value) {
      const steps =
        action === "remove"
          ? plan.steps.filter((s) => s.id !== value)
          : plan.steps.map((s) => (s.id === value ? { ...s, status: "completed" as const } : s));
      onChange({ ...plan, steps: advance(steps) });
    } else if (action === "regenerate") {
      onChange({ ...buildPlan(plan), goals: plan.goals });
    }
    close();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) close();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Understand me</DialogTitle>
          <DialogDescription>Your path, adjustable at any time.</DialogDescription>
        </DialogHeader>

        {action === null ? (
          <div className="space-y-2">
            {ACTIONS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => (a.id === "regenerate" ? (setAction(a.id), setValue("")) : setAction(a.id))}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-left text-sm transition-colors hover:bg-secondary"
              >
                {a.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={close}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> Back
            </button>

            {(action === "career" || action === "language" || action === "add") && (
              <Input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={
                  action === "career"
                    ? "New target career"
                    : action === "language"
                      ? "Preferred language"
                      : "New step title"
                }
              />
            )}

            {(action === "skip" || action === "remove" || action === "why") && (
              <div className="space-y-2">
                {plan.steps.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setValue(s.id)}
                    className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${
                      value === s.id ? "border-primary bg-secondary" : "border-border bg-card hover:bg-secondary"
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            )}

            {action === "why" && value ? (
              <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                {plan.steps.find((s) => s.id === value)?.why}
              </p>
            ) : null}

            {action === "regenerate" ? (
              <p className="text-sm text-muted-foreground">
                This rebuilds your {plan.career} path from scratch. Weekly goals stay.
              </p>
            ) : null}

            {action !== "why" ? (
              <button
                type="button"
                onClick={apply}
                className="h-11 w-full rounded-full border border-border bg-secondary text-sm font-semibold transition-colors hover:bg-accent"
              >
                Apply
              </button>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
