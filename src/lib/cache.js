// Simple in-memory cache with TTL (milliseconds)
// Not for production-critical use; suitable for lightweight serverless/runtime

const store = new Map();

export function setCache(key, value, ttlMs) {
  const expiresAt = Date.now() + ttlMs;
  store.set(key, { value, expiresAt });
}

export function getCache(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

export function delCache(key) {
  store.delete(key);
}

export function clearCache() {
  store.clear();
}


