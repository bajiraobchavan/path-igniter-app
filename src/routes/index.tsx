import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Compass, HelpCircle, Link2, Sparkles } from "lucide-react";

import { PrimaryAction, GhostAction } from "@/components/PrimaryAction";
import { ConnectProfilesDialog } from "@/components/ConnectProfilesDialog";
import { CreateCareerPathDialog } from "@/components/CreateCareerPathDialog";
import { ConfusedDialog } from "@/components/ConfusedDialog";
import { UnderstandMeDialog } from "@/components/UnderstandMeDialog";
import { LearningPath } from "@/components/LearningPath";
import { WeeklyGoals } from "@/components/WeeklyGoals";
import { WeekendReview } from "@/components/WeekendReview";
import { MentorInput } from "@/components/MentorInput";
import { listConnections } from "@/lib/connections.functions";
import { usePlan } from "@/lib/skillmaps-store";

const TITLE = "Skill Maps — Your AI career navigator";
const DESCRIPTION =
  "One clean screen: see where you are, choose where you're going, and know the single next step in your learning path.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { plan, ready, save } = usePlan();
  const [connectOpen, setConnectOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [confusedOpen, setConfusedOpen] = useState(false);
  const [understandOpen, setUnderstandOpen] = useState(false);

  const { data: connections } = useQuery({
    queryKey: ["connections"],
    queryFn: () => listConnections(),
  });

  const connectedCount = connections?.filter((c) => c.connected).length ?? 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-5 px-5 py-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight">Skill Maps</span>
        </div>
        <GhostAction icon={<Link2 className="size-4" />} onClick={() => setConnectOpen(true)}>
          {connectedCount ? `${connectedCount} connected` : "Connect profiles"}
        </GhostAction>
      </header>

      <section>
        <h1 className="text-3xl font-bold leading-tight">
          {plan ? (
            <>
              You're becoming a <span className="text-gradient-hot">{plan.career}</span>
            </>
          ) : (
            <>
              Where do you want to <span className="text-gradient-hot">go next?</span>
            </>
          )}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {plan
            ? `${plan.timeline} · ${plan.hoursPerWeek} · ${plan.language}`
            : "Answer three questions and get one clear path."}
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <PrimaryAction icon={<Compass className="size-5" />} onClick={() => setCreateOpen(true)}>
          {plan ? "New career path" : "Create career path"}
        </PrimaryAction>
        <PrimaryAction icon={<HelpCircle className="size-5" />} onClick={() => setConfusedOpen(true)}>
          I'm confused
        </PrimaryAction>
      </div>

      {ready && plan ? (
        <>
          <LearningPath plan={plan} />
          <WeeklyGoals
            plan={plan}
            onToggle={(id) =>
              save({
                ...plan,
                goals: plan.goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)),
              })
            }
          />
          <WeekendReview plan={plan} />
          <div className="flex justify-center">
            <GhostAction onClick={() => setUnderstandOpen(true)}>Understand me</GhostAction>
          </div>
        </>
      ) : null}

      <div className="mt-auto pt-4">
        <MentorInput />
      </div>

      <ConnectProfilesDialog open={connectOpen} onOpenChange={setConnectOpen} />
      <CreateCareerPathDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={save} />
      <ConfusedDialog
        open={confusedOpen}
        onOpenChange={setConfusedOpen}
        plan={plan}
        connections={connections ?? []}
      />
      {plan ? (
        <UnderstandMeDialog
          open={understandOpen}
          onOpenChange={setUnderstandOpen}
          plan={plan}
          onChange={save}
        />
      ) : null}
    </main>
  );
}
