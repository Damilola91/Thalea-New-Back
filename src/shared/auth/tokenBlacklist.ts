/**
 * Blacklist token JWT per invalidare sessioni al logout.
 *
 * Implementazione in memoria — adatta a single-instance (Render free/starter).
 * Per deployment multi-istanza sostituire con Redis:
 *   await redisClient.setEx(`blacklist:${jti}`, ttlSeconds, "1")
 *
 * La pulizia automatica rimuove i token scaduti ogni ora
 * per evitare memory leak nel lungo periodo.
 */

interface BlacklistedToken {
  expiresAt: number; // Unix timestamp ms
}

const blacklist = new Map<string, BlacklistedToken>();

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 ora

// Pulizia periodica dei token scaduti
setInterval(() => {
  const now = Date.now();
  for (const [token, entry] of blacklist.entries()) {
    if (entry.expiresAt <= now) {
      blacklist.delete(token);
    }
  }
}, CLEANUP_INTERVAL_MS);

export const addToBlacklist = (token: string, expiresAt: number): void => {
  blacklist.set(token, { expiresAt });
};

export const isBlacklisted = (token: string): boolean => {
  const entry = blacklist.get(token);

  if (!entry) return false;

  // Token scaduto naturalmente — rimuovi e considera valido (non serve più)
  if (entry.expiresAt <= Date.now()) {
    blacklist.delete(token);
    return false;
  }

  return true;
};
