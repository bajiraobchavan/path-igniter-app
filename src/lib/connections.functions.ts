import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const listConnections = createServerFn({ method: "GET" }).handler(async () => {
  const { readConnections, publicConnections } = await import("./connections.server");
  return publicConnections(readConnections());
});

export const startOAuth = createServerFn({ method: "POST" })
  .inputValidator((data: { provider: "github" | "linkedin" }) => data)
  .handler(async ({ data }) => {
    const { authorizeUrl, setOAuthState } = await import("./connections.server");
    const request = getRequest();
    const url = new URL(request.url);
    const forwarded = url.hostname === "localhost" ? request.headers.get("x-forwarded-host") : null;
    const origin = forwarded ? `https://${forwarded}` : url.origin;
    const state = crypto.randomUUID();
    setOAuthState(`${data.provider}:${state}`);
    return { authorizationUrl: authorizeUrl(data.provider, origin, state) };
  });

export const connectUsername = createServerFn({ method: "POST" })
  .inputValidator((data: { provider: "leetcode" | "hackerrank"; username: string }) => {
    const username = data.username.trim();
    if (!username) throw new Error("Enter a username");
    return { provider: data.provider, username };
  })
  .handler(async ({ data }) => {
    const { fetchLeetcode, fetchHackerrank, saveConnection, readConnections, publicConnections } =
      await import("./connections.server");
    const conn =
      data.provider === "leetcode"
        ? await fetchLeetcode(data.username)
        : await fetchHackerrank(data.username);
    saveConnection(conn);
    return publicConnections(readConnections());
  });

export const disconnectProvider = createServerFn({ method: "POST" })
  .inputValidator((data: { provider: "github" | "linkedin" | "leetcode" | "hackerrank" }) => data)
  .handler(async ({ data }) => {
    const { removeConnection, readConnections, publicConnections } = await import("./connections.server");
    removeConnection(data.provider);
    return publicConnections(readConnections());
  });
