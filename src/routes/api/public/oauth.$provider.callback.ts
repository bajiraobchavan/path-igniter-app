import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/oauth/$provider/callback")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const {
          exchangeGithub,
          exchangeLinkedin,
          saveConnection,
          consumeOAuthState,
        } = await import("@/lib/connections.server");

        const url = new URL(request.url);
        const provider = params.provider;
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const stored = consumeOAuthState();

        const done = (ok: boolean, message: string) =>
          new Response(
            `<!doctype html><html><body style="font-family:system-ui;background:#1b1620;color:#f4f0f5;display:grid;place-items:center;height:100vh;margin:0">
<p>${message}</p>
<script>
  window.opener && window.opener.postMessage({ type: "skillmaps-oauth", provider: ${JSON.stringify(provider)}, ok: ${ok} }, window.location.origin);
  window.close();
</script></body></html>`,
            { headers: { "Content-Type": "text/html; charset=utf-8" } },
          );

        if (provider !== "github" && provider !== "linkedin") {
          return done(false, "Unsupported provider.");
        }
        if (!code || !state || stored !== `${provider}:${state}`) {
          return done(false, "Authorization could not be verified. Close this window and try again.");
        }

        try {
          const forwarded = url.hostname === "localhost" ? request.headers.get("x-forwarded-host") : null;
          const origin = forwarded ? `https://${forwarded}` : url.origin;
          const conn =
            provider === "github"
              ? await exchangeGithub(code, origin)
              : await exchangeLinkedin(code, origin);
          saveConnection(conn);
          return done(true, "Connected. You can close this window.");
        } catch (error) {
          console.error(error);
          return done(false, error instanceof Error ? error.message : "Connection failed.");
        }
      },
    },
  },
});
