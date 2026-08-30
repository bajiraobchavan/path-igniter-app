import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CareerPlan } from "@/lib/skillmaps-store";

type ConnectionSummary = { provider: string; connected: boolean; username: string | null };

const QUESTIONS = [
  "Which career should I choose?",
  "Which programming language should I focus on?",
  "What am I good at?",
  "What should I learn next?",
] as const;

function answer(
  question: (typeof QUESTIONS)[number],
  plan: CareerPlan | null,
  connected: string[],
): { headline: string; body: string } {
  const sources = connected.length ? connected.join(", ") : "no connected profiles yet";
  switch (question) {
    case "Which career should I choose?":
      return {
        headline: plan ? `${plan.career} still fits you` : "Data Engineer looks like a good fit",
        body: `Based on ${sources}. This is a recommendation, not a decision — you can explore a different path any time.`,
      };
    case "Which programming language should I focus on?":
      return {
        headline: `Stay with ${plan?.language ?? "Python"} for now`,
        body: `Your recent activity (${sources}) points there. One language until you ship a project, then widen.`,
      };
    case "What am I good at?":
      return {
        headline: "Consistent problem solving and SQL",
        body: `Read from ${sources}. Your weaker area is shipping finished projects — that's what the current step targets.`,
      };
    case "What should I learn next?":
      return {
        headline: plan?.steps.find((s) => s.status === "current")?.title ?? "Databases & SQL",
        body: "Finish the current step before starting anything new. Everything after it depends on it.",
      };
  }
}

export function ConfusedDialog({
  open,
  onOpenChange,
  plan,
  connections,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: CareerPlan | null;
  connections: ConnectionSummary[];
}) {
  const [picked, setPicked] = useState<(typeof QUESTIONS)[number] | null>(null);
  const connected = connections.filter((c) => c.connected).map((c) => c.provider);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setPicked(null);
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>I'm confused</DialogTitle>
          <DialogDescription>Pick the question that's on your mind.</DialogDescription>
        </DialogHeader>

        {picked ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> Back
            </button>
            <p className="text-sm text-muted-foreground">{picked}</p>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-base font-semibold">{answer(picked, plan, connected).headline}</p>
              <p className="mt-2 text-sm text-muted-foreground">{answer(picked, plan, connected).body}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setPicked(q)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-left text-sm transition-colors hover:bg-secondary"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
