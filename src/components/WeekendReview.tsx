import type { CareerPlan } from "@/lib/skillmaps-store";

export function WeekendReview({ plan }: { plan: CareerPlan }) {
  const done = plan.goals.filter((g) => g.done).length;
  const total = plan.goals.length || 1;
  const percent = Math.round((done / total) * 100);
  const nextGoal = plan.goals.find((g) => !g.done)?.label ?? "Start next week's step";

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold text-muted-foreground">Weekend review</h2>

      <p className="mt-3 text-lg font-semibold">
        {done}/{plan.goals.length} goals completed
      </p>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className="gradient-hot h-full rounded-full" style={{ width: `${percent}%` }} />
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Skill improvement: {percent >= 75 ? "strong" : percent >= 40 ? "steady" : "slow"} this week.
      </p>
      <p className="mt-1 text-sm">
        <span className="text-muted-foreground">Next week: </span>
        {nextGoal}
      </p>
    </section>
  );
}
