import { getCookie, setCookie } from "@tanstack/react-start/server";

export const PROVIDERS = ["github", "linkedin", "leetcode", "hackerrank"] as const;
export type ProviderId = (typeof PROVIDERS)[number];

export type Connection = {
  provider: ProviderId;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  /** Small snapshot of public profile data, later consumed by Skill Maps analysis. */
  profile?: Record<string, unknown>;
  connectedAt: string;
  accessToken?: string;
};

export type ConnectionStore = Partial<Record<ProviderId, Connection>>;

const COOKIE = "skillmaps_connections";
const STATE_COOKIE = "skillmaps_oauth_state";

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: true,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export function readConnections(): ConnectionStore {
  const raw = getCookie(COOKIE);
  if (!raw) return {};
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as ConnectionStore;
  } catch {
    return {};
  }
}

export function writeConnections(store: ConnectionStore) {
  setCookie(COOKIE, Buffer.from(JSON.stringify(store), "utf8").toString("base64"), cookieOpts);
}

export function saveConnection(conn: Connection) {
  const store = readConnections();
  store[conn.provider] = conn;
  writeConnections(store);
}

export function removeConnection(provider: ProviderId) {
  const store = readConnections();
  delete store[provider];
  writeConnections(store);
}

/** Never send tokens to the browser. */
export function publicConnections(store: ConnectionStore) {
  return PROVIDERS.map((provider) => {
    const c = store[provider];
    return {
      provider,
      connected: Boolean(c),
      username: c?.username ?? null,
      displayName: c?.displayName ?? null,
      avatarUrl: c?.avatarUrl ?? null,
      connectedAt: c?.connectedAt ?? null,
    };
  });
}

export function setOAuthState(state: string) {
  setCookie(STATE_COOKIE, state, { ...cookieOpts, maxAge: 600 });
}

export function consumeOAuthState(): string | undefined {
  const state = getCookie(STATE_COOKIE);
  setCookie(STATE_COOKIE, "", { ...cookieOpts, maxAge: 0 });
  return state;
}

export function oauthConfig(provider: "github" | "linkedin") {
  const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
  const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];
  if (!clientId || !clientSecret) {
    throw new Error(
      `${provider} is not configured yet. Add ${provider.toUpperCase()}_CLIENT_ID and ${provider.toUpperCase()}_CLIENT_SECRET.`,
    );
  }
  return { clientId, clientSecret };
}

export function redirectUri(origin: string, provider: string) {
  return `${origin}/api/public/oauth/${provider}/callback`;
}

export function authorizeUrl(provider: "github" | "linkedin", origin: string, state: string) {
  const { clientId } = oauthConfig(provider);
  const uri = redirectUri(origin, provider);
  if (provider === "github") {
    return `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(uri)}&scope=${encodeURIComponent("read:user public_repo")}&state=${state}`;
  }
  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(uri)}&scope=${encodeURIComponent("openid profile email")}&state=${state}`;
}

export async function exchangeGithub(code: string, origin: string): Promise<Connection> {
  const { clientId, clientSecret } = oauthConfig("github");
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri(origin, "github"),
    }),
  });
  const tokenBody = await tokenRes.text();
  if (!tokenRes.ok) throw new Error(`GitHub token exchange failed [${tokenRes.status}]: ${tokenBody}`);
  const token = JSON.parse(tokenBody) as { access_token?: string; error_description?: string };
  if (!token.access_token) throw new Error(token.error_description ?? "GitHub did not return a token");

  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token.access_token}`, Accept: "application/vnd.github+json" },
  });
  const userText = await userRes.text();
  if (!userRes.ok) throw new Error(`GitHub profile fetch failed [${userRes.status}]: ${userText}`);
  const user = JSON.parse(userText) as Record<string, unknown>;

  return {
    provider: "github",
    username: String(user.login ?? ""),
    displayName: (user.name as string) ?? (user.login as string),
    avatarUrl: user.avatar_url as string,
    accessToken: token.access_token,
    connectedAt: new Date().toISOString(),
    profile: {
      publicRepos: user.public_repos,
      followers: user.followers,
      bio: user.bio,
      company: user.company,
      location: user.location,
    },
  };
}

export async function exchangeLinkedin(code: string, origin: string): Promise<Connection> {
  const { clientId, clientSecret } = oauthConfig("linkedin");
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri(origin, "linkedin"),
    client_id: clientId,
    client_secret: clientSecret,
  });
  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const tokenBody = await tokenRes.text();
  if (!tokenRes.ok) throw new Error(`LinkedIn token exchange failed [${tokenRes.status}]: ${tokenBody}`);
  const token = JSON.parse(tokenBody) as { access_token?: string };
  if (!token.access_token) throw new Error("LinkedIn did not return a token");

  const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const meText = await meRes.text();
  if (!meRes.ok) throw new Error(`LinkedIn profile fetch failed [${meRes.status}]: ${meText}`);
  const me = JSON.parse(meText) as Record<string, unknown>;

  return {
    provider: "linkedin",
    username: String(me.email ?? me.sub ?? "linkedin-user"),
    displayName: (me.name as string) ?? "LinkedIn member",
    avatarUrl: me.picture as string,
    accessToken: token.access_token,
    connectedAt: new Date().toISOString(),
    profile: { locale: me.locale, email: me.email },
  };
}

/** LeetCode has no official OAuth: link the public profile through its public GraphQL API. */
export async function fetchLeetcode(username: string): Promise<Connection> {
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
    body: JSON.stringify({
      query: `query($username: String!) {
        matchedUser(username: $username) {
          username
          profile { realName userAvatar ranking }
          submitStatsGlobal { acSubmissionNum { difficulty count } }
        }
      }`,
      variables: { username },
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`LeetCode lookup failed [${res.status}]: ${text}`);
  const body = JSON.parse(text) as {
    data?: { matchedUser?: { username: string; profile?: Record<string, unknown>; submitStatsGlobal?: unknown } };
  };
  const user = body.data?.matchedUser;
  if (!user) throw new Error(`No LeetCode user named "${username}"`);
  return {
    provider: "leetcode",
    username: user.username,
    displayName: (user.profile?.realName as string) || user.username,
    avatarUrl: user.profile?.userAvatar as string,
    connectedAt: new Date().toISOString(),
    profile: { ranking: user.profile?.ranking, solved: user.submitStatsGlobal },
  };
}

/** HackerRank has no public OAuth app flow: link the public profile through its REST profile endpoint. */
export async function fetchHackerrank(username: string): Promise<Connection> {
  const res = await fetch(`https://www.hackerrank.com/rest/hackers/${encodeURIComponent(username)}/profile`, {
    headers: { Accept: "application/json" },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HackerRank lookup failed [${res.status}]: ${text.slice(0, 200)}`);
  const body = JSON.parse(text) as { model?: Record<string, unknown> };
  const model = body.model;
  if (!model?.username) throw new Error(`No HackerRank user named "${username}"`);
  return {
    provider: "hackerrank",
    username: String(model.username),
    displayName: (model.name as string) || String(model.username),
    avatarUrl: model.avatar as string,
    connectedAt: new Date().toISOString(),
    profile: { level: model.level, school: model.school, country: model.country },
  };
}
