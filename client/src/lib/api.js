const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Thin fetch wrapper: attaches the Firebase ID token and throws
 * on non-2xx so callers can catch a single error type.
 */
export async function apiFetch(path, { method = 'GET', body, getToken } = {}) {
  const token = await getToken?.();

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return res.json();
}