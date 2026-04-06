/** Override with VITE_API_BASE_URL in `.env.local` when using a local API (e.g. https://localhost:7287). */
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://brighthut-befxhqfdabcpfscu.centralus-01.azurewebsites.net";

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}
