// Single-owner demo auth: one shared password, one static session token.
// Set OWNER_PASSWORD and OWNER_SESSION_TOKEN in .env.local before using this
// for anything beyond local prototyping.
export const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "willowbrook-owner";
export const OWNER_SESSION_TOKEN =
  process.env.OWNER_SESSION_TOKEN || "willowbrook-owner-session-demo-token";
export const OWNER_SESSION_COOKIE = "owner_session";
