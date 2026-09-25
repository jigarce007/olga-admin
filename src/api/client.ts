const baseUrl = (import.meta.env.VITE_CORE_API_URL ?? '').replace(/\/$/, '');

export const useMocks = (import.meta.env.VITE_USE_MOCKS ?? 'true') !== 'false';

export class ApiError extends Error {
  constructor(public status: number, public code: string, public correlationId: string | null) {
    super(`${status} ${code}`);
  }
}

export async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  // Olga.Core rejects /v1 writes without an idempotency key.
  if (method !== 'GET') headers['Idempotency-Key'] = crypto.randomUUID();

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    let code = 'REQUEST_FAILED';
    try {
      const err = await res.json();
      code = err.code ?? err.error ?? code;
    } catch { /* non-JSON error body */ }
    throw new ApiError(res.status, code, res.headers.get('X-Correlation-Id'));
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
