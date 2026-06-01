import type { RecommendRequest, RecommendResponse } from '../types';

export async function makeHttpEngine(
  url: string,
  req: RecommendRequest,
  timeoutMs = 10_000
): Promise<RecommendResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP engine ${url} → ${res.status}: ${text}`);
    }
    return res.json() as Promise<RecommendResponse>;
  } finally {
    clearTimeout(timer);
  }
}
