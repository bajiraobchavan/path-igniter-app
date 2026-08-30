import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Github, Linkedin, Code2, Terminal, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  listConnections,
  startOAuth,
  connectUsername,
  disconnectProvider,
} from "@/lib/connections.functions";

type ProviderId = "github" | "linkedin" | "leetcode" | "hackerrank";

const META: Record<ProviderId, { label: string; icon: typeof Github; kind: "oauth" | "username" }> = {
  github: { label: "GitHub", icon: Github, kind: "oauth" },
  linkedin: { label: "LinkedIn", icon: Linkedin, kind: "oauth" },
  leetcode: { label: "LeetCode", icon: Code2, kind: "username" },
  hackerrank: { label: "HackerRank", icon: Terminal, kind: "username" },
};

export function ConnectProfilesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [pending, setPending] = useState<ProviderId | null>(null);
  const [usernames, setUsernames] = useState<Record<string, string>>({});

  const { data: connections } = useQuery({
    queryKey: ["connections"],
    queryFn: () => listConnections(),
  });

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "skillmaps-oauth") return;
      setPending(null);
      qc.invalidateQueries({ queryKey: ["connections"] });
      toast[event.data.ok ? "success" : "error"](
        event.data.ok ? `${event.data.provider} connected` : "Connection was not completed",
      );
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [qc]);

  const oauth = useMutation({
    mutationFn: (provider: "github" | "linkedin") => startOAuth({ data: { provider } }),
    onMutate: (provider) => setPending(provider),
    onSuccess: ({ authorizationUrl }) => {
      const popup = window.open(authorizationUrl, "skillmaps-oauth", "width=620,height=720");
      if (!popup) {
        setPending(null);
        toast.error("Allow popups to connect this profile.");
      }
    },
    onError: (error: Error) => {
      setPending(null);
      toast.error(error.message);
    },
  });

  const link = useMutation({
    mutationFn: (vars: { provider: "leetcode" | "hackerrank"; username: string }) =>
      connectUsername({ data: vars }),
    onMutate: (vars) => setPending(vars.provider),
    onSuccess: (data) => {
      qc.setQueryData(["connections"], data);
      setPending(null);
      toast.success("Profile connected");
    },
    onError: (error: Error) => {
      setPending(null);
      toast.error(error.message);
    },
  });

  const unlink = useMutation({
    mutationFn: (provider: ProviderId) => disconnectProvider({ data: { provider } }),
    onSuccess: (data) => qc.setQueryData(["connections"], data),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect profiles</DialogTitle>
          <DialogDescription>
            Skill Maps reads these to understand where you are today.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {(Object.keys(META) as ProviderId[]).map((id) => {
            const meta = META[id];
            const Icon = meta.icon;
            const state = connections?.find((c) => c.provider === id);
            const busy = pending === id;

            return (
              <div key={id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-3">
                  <Icon className="size-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{meta.label}</p>
                    {state?.connected ? (
                      <p className="truncate text-xs text-muted-foreground">{state.username}</p>
                    ) : null}
                  </div>

                  {state?.connected ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs text-success">
                        <Check className="size-3.5" /> Connected
                      </span>
                      <button
                        type="button"
                        onClick={() => unlink.mutate(id)}
                        className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (meta.kind === "oauth") oauth.mutate(id as "github" | "linkedin");
                        else
                          link.mutate({
                            provider: id as "leetcode" | "hackerrank",
                            username: usernames[id] ?? "",
                          });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-60"
                    >
                      {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
                      Connect
                    </button>
                  )}
                </div>

                {!state?.connected && meta.kind === "username" ? (
                  <Input
                    value={usernames[id] ?? ""}
                    onChange={(e) => setUsernames((u) => ({ ...u, [id]: e.target.value }))}
                    placeholder={`${meta.label} username`}
                    className="mt-2 h-9"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
