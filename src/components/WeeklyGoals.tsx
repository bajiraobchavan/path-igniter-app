import { Check } from "lucide-react";
import type { CareerPlan } from "@/lib/skillmaps-store";

export function WeeklyGoals({
  plan,
  onToggle,
}: {
  plan: CareerPlan;
  onToggle: (goalId: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">This week</h2>
        <span className="text-xs text-muted-foreground">Week {plan.week}</span>
      </div>

      <ul className="mt-3 space-y-1">
        {plan.goals.map((goal) => (
          <li key={goal.id}>
            <button
              type="button"
              onClick={() => onToggle(goal.id)}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-secondary"
            >
              <span
                className={`grid size-4 shrink-0 place-items-center rounded-full border ${
                  goal.done ? "border-success text-success" : "border-border text-transparent"
                }`}
              >
                <Check className="size-3" />
              </span>
              <span className={goal.done ? "text-sm text-muted-foreground line-through" : "text-sm"}>
                {goal.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
