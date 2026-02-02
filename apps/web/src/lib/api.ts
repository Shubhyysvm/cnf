const DEFAULT_BASE = "http://localhost:3001";

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE;

export async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) throw new Error(`API ${path} ${res.status}`);
  return res.json();
}
