import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildPlan, type CareerPlan } from "@/lib/skillmaps-store";

export function CreateCareerPathDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (plan: CareerPlan) => void;
}) {
  const [career, setCareer] = useState("Data Engineer");
  const [timeline, setTimeline] = useState("2 months");
  const [hours, setHours] = useState("6 hours/week");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create career path</DialogTitle>
          <DialogDescription>Three answers. That's all we need to start.</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onCreate(buildPlan({ career, timeline, hoursPerWeek: hours }));
            onOpenChange(false);
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="career">Target career</Label>
            <Input id="career" value={career} onChange={(e) => setCareer(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="timeline">Timeline</Label>
            <Input id="timeline" value={timeline} onChange={(e) => setTimeline(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hours">Available learning time</Label>
            <Input id="hours" value={hours} onChange={(e) => setHours(e.target.value)} required />
          </div>

          <button
            type="submit"
            className="gradient-hot h-11 w-full rounded-full text-sm font-semibold text-primary-foreground"
          >
            Generate my path
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
