// Magic-link tokens for the claim flow.
//
// The token IS the authentication. There is no login, no password and no
// session: possession of the link is the whole proof that somebody at the
// agency's own domain asked to edit the listing. That makes three
// properties load-bearing rather than nice to have.
//
//   1. UNGUESSABLE. 256 bits from the platform CSPRNG. A token a script
//      could enumerate would let anyone rewrite any listing in the
//      directory.
//   2. SHORT LIVED. 24 hours. A link forwarded into a shared inbox, a
//      ticketing system or a Slack channel stops working the next day.
//   3. SINGLE USE. Marked used the moment a claim is submitted, so a
//      forwarded link cannot be replayed to overwrite what the agency
//      just saved.
//
// Tokens live only in KV. They are worthless after a day and there is
// nothing to reconcile, so unlike claims themselves they have no
// committed layer.

import { kvDelete, kvGet, kvSet } from "@/lib/toolkit/kv";
import type { ClaimToken } from "./types";

/** Token lifetime. Long enough to survive an agency reading the email the
 *  next morning, short enough that a forwarded link expires. */
export const CLAIM_TOKEN_TTL_SECONDS = 24 * 60 * 60;

/** Bytes of entropy per token. 32 bytes is 256 bits. */
const TOKEN_BYTES = 32;

/** Key prefix. Versioned so a shape change cannot read stale records. */
const TOKEN_KEY_PREFIX = "directory:claim-token:v1:";

/**
 * Why a token cannot be used.
 *
 * `used` and `expired` are separate because the pages say different
 * things: an expired link offers to send a new one, while a used link
 * says the claim already went through and links to the live profile - an
 * agency that clicks its own link twice should not be told something went
 * wrong.
 */
export type TokenRejection = "missing" | "expired" | "used";

/** Result of looking a token up. */
export type TokenLookup =
  | { ok: true; token: ClaimToken }
  | { ok: false; reason: TokenRejection };

/**
 * Generates a URL-safe random token.
 *
 * `crypto.getRandomValues` rather than `Math.random`, which is seeded
 * predictably enough that tokens from one process could be guessed from
 * one another.
 *
 * @returns A 43-character base64url string.
 */
function generateToken(): string {
  const bytes = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Mints a token and stores it.
 *
 * @param params - Who is claiming what, and whether their email domain
 *                  matched the agency's.
 * @returns The token string, or null when the store refused the write.
 *          A null MUST stop the flow: emailing a link whose token was
 *          never stored sends an agency to a page that will reject it.
 */
export async function createClaimToken(params: {
  agencySlug: string;
  email: string;
  verified: boolean;
}): Promise<string | null> {
  try {
    const token = generateToken();
    const record: ClaimToken = {
      token,
      agencySlug: params.agencySlug,
      email: params.email,
      expiresAt: new Date(Date.now() + CLAIM_TOKEN_TTL_SECONDS * 1000).toISOString(),
      usedAt: null,
      verified: params.verified,
    };
    const stored = await kvSet(
      `${TOKEN_KEY_PREFIX}${token}`,
      JSON.stringify(record),
      CLAIM_TOKEN_TTL_SECONDS,
    );
    return stored ? token : null;
  } catch {
    return null;
  }
}

/**
 * Looks a token up and checks it is still usable.
 *
 * Checks the stored `expiresAt` as well as relying on the store's TTL.
 * The two normally agree, but the in-memory fallback in lib/toolkit/kv.ts
 * is per-instance and its clock is not something to trust a credential
 * to - an explicit comparison costs nothing and closes that gap.
 *
 * @param token - The token from the URL.
 * @returns The token record, or why it was refused.
 */
export async function readClaimToken(token: string | null | undefined): Promise<TokenLookup> {
  try {
    const key = token?.trim();
    if (!key) return { ok: false, reason: "missing" };

    const raw = await kvGet(`${TOKEN_KEY_PREFIX}${key}`);
    if (!raw) return { ok: false, reason: "missing" };

    const record = JSON.parse(raw) as ClaimToken;
    if (!record?.agencySlug || !record?.email) return { ok: false, reason: "missing" };
    if (record.usedAt) return { ok: false, reason: "used" };
    if (new Date(record.expiresAt).getTime() <= Date.now()) return { ok: false, reason: "expired" };

    return { ok: true, token: record };
  } catch {
    return { ok: false, reason: "missing" };
  }
}

/**
 * Marks a token used, so the link cannot be replayed.
 *
 * Rewrites the record rather than deleting it, so a second click gets
 * "this claim already went through" instead of "this link is invalid" -
 * the same event, but only one of those two sentences is true.
 *
 * @param token - The token that was just spent.
 */
export async function markClaimTokenUsed(token: string): Promise<void> {
  try {
    const lookup = await readClaimToken(token);
    if (!lookup.ok) return;
    const used: ClaimToken = { ...lookup.token, usedAt: new Date().toISOString() };
    await kvSet(`${TOKEN_KEY_PREFIX}${token}`, JSON.stringify(used), CLAIM_TOKEN_TTL_SECONDS);
  } catch {
    // A failure here means a link stays live until its TTL. Worth a
    // shrug, not worth failing the claim the agency just completed.
  }
}

/**
 * Deletes a token outright.
 *
 * Only used when a claim is abandoned mid-flight; the normal path is
 * `markClaimTokenUsed`.
 *
 * @param token - The token to revoke.
 */
export async function revokeClaimToken(token: string): Promise<void> {
  try {
    await kvDelete(`${TOKEN_KEY_PREFIX}${token}`);
  } catch {
    // Nothing to do.
  }
}
