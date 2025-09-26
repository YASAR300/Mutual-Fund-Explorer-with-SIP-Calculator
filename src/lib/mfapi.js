import { getCache, setCache } from "./cache";

const BASE_URL = "https://api.mfapi.in";
const TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

async function fetchJson(url) {
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.json();
}

export async function getAllSchemes() {
  const cacheKey = "mf_all_schemes";
  const cached = getCache(cacheKey);
  if (cached) return cached;
  const data = await fetchJson(`${BASE_URL}/mf`);
  setCache(cacheKey, data, TTL_MS);
  return data;
}

export async function getScheme(code) {
  const cacheKey = `mf_scheme_${code}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;
  const data = await fetchJson(`${BASE_URL}/mf/${code}`);
  setCache(cacheKey, data, TTL_MS);
  return data;
}

export function normalizeNavHistory(schemeData) {
  // schemeData.data is array of { date: 'DD-MM-YYYY', nav: '123.4567' }
  if (!schemeData || !Array.isArray(schemeData.data)) return [];
  return schemeData.data
    .map((d) => {
      const [dd, mm, yyyy] = d.date.split("-");
      const iso = `${yyyy}-${mm}-${dd}`;
      const nav = parseFloat(d.nav);
      return { date: iso, nav };
    })
    .filter((d) => Number.isFinite(d.nav) && d.nav > 0)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}


