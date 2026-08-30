import { useCallback, useEffect, useState } from "react";

export type StepStatus = "completed" | "current" | "next" | "upcoming";

export type PathStep = {
  id: string;
  title: string;
  status: StepStatus;
  focus: string;
  why: string;
  outcome: string;
};

export type Goal = { id: string; label: string; done: boolean };

export type CareerPlan = {
  career: string;
  timeline: string;
  hoursPerWeek: string;
  language: string;
  week: number;
  steps: PathStep[];
  goals: Goal[];
};

const KEY = "skillmaps-plan";

const STEP_BLUEPRINT: Array<Omit<PathStep, "id" | "status">> = [
  {
    title: "Core language fundamentals",
    focus: "Syntax, data structures, problem solving",
    why: "Every later step assumes you can write clean code without looking things up.",
    outcome: "Solve 30 practice problems comfortably.",
  },
  {
    title: "Databases & SQL",
    focus: "Joins, aggregation, indexing, modelling",
    why: "This is the daily language of the role you picked.",
    outcome: "Query a real dataset end to end.",
  },
  {
    title: "Build a real project",
    focus: "One ETL-style pipeline, shipped",
    why: "Projects are what interviewers actually read.",
    outcome: "A working repo with a README.",
  },
  {
    title: "Cloud & orchestration",
    focus: "Scheduling, storage, deployment basics",
    why: "Turns a script into something a team can run.",
    outcome: "Your pipeline runs on a schedule.",
  },
  {
    title: "Interview preparation",
    focus: "Role questions, system design, your story",
    why: "The last mile between skills and an offer.",
    outcome: "Two mock interviews done.",
  },
];

export function buildPlan(input: {
  career: string;
  timeline: string;
  hoursPerWeek: string;
  language?: string;
}): CareerPlan {
  const steps: PathStep[] = STEP_BLUEPRINT.map((s, i) => ({
    ...s,
    id: `step-${i + 1}`,
    status: i === 0 ? "completed" : i === 1 ? "current" : i === 2 ? "next" : "upcoming",
  }));

  return {
    career: input.career,
    timeline: input.timeline,
    hoursPerWeek: input.hoursPerWeek,
    language: input.language ?? "Python",
    week: 3,
    steps,
    goals: [
      { id: "g1", label: "Complete SQL", done: true },
      { id: "g2", label: "Solve 20 problems", done: true },
      { id: "g3", label: "Build ETL project", done: true },
      { id: "g4", label: "Push project to GitHub", done: false },
    ],
  };
}

export function usePlan() {
  const [plan, setPlan] = useState<CareerPlan | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setPlan(JSON.parse(raw) as CareerPlan);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const save = useCallback((next: CareerPlan | null) => {
    setPlan(next);
    if (next) window.localStorage.setItem(KEY, JSON.stringify(next));
    else window.localStorage.removeItem(KEY);
  }, []);

  return { plan, ready, save };
}
