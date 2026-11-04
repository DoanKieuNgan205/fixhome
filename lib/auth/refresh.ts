import "server-only"
import { z } from "zod"
import { REFRESH_PATH } from "./config"
import type { SessionTokens } from "./session"

const tokenSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1).optional(),
  expires_in: z.number().int().positive(),
})

export class RefreshError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = "RefreshError"
  }
}

// Coalesce overlapping refreshes in this server instance. Do not retain tokens
// after completion or rely on this map for cross-instance coordination.
const pending = new Map<string, Promise<SessionTokens>>()

export function refreshSession(refreshToken: string): Promise<SessionTokens> {
  const existing = pending.get(refreshToken)
  if (existing) return existing

  const promise = requestRefresh(refreshToken).finally(() => pending.delete(refreshToken))
  pending.set(refreshToken, promise)
  return promise
}

async function requestRefresh(refreshToken: string): Promise<SessionTokens> {
  const base = process.env.API_BASE_URL
  if (!base) throw new RefreshError(500, "SERVER")

  let response: Response
  try {
    response = await fetch(`${base}${REFRESH_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    })
  } catch {
    throw new RefreshError(502, "NETWORK")
  }

  if ([400, 401, 403].includes(response.status)) {
    throw new RefreshError(401, "UNAUTHORIZED")
  }
  if (response.status === 429) throw new RefreshError(429, "TOO_MANY")
  if (!response.ok) throw new RefreshError(502, "SERVER")

  const result = tokenSchema.safeParse(await response.json().catch(() => null))
  if (!result.success) throw new RefreshError(502, "INVALID_TOKEN_RESPONSE")

  return { ...result.data, refresh_token: result.data.refresh_token ?? refreshToken }
}
