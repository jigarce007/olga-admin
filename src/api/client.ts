import { getAccessToken } from '../auth/msal';
import { config } from '../config';

export class ApiError extends Error {
  constructor(public status: number, public code: string, public correlationId: string | null) {
    super(`${status} ${code}`);
    this.name = 'ApiError';
  }
}

export const mocksEnabled = () => config().useMocks;

export async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const { apiBaseUrl, requestTimeoutMs } = config();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  // Olga.Core rejects /v1 writes without an idempotency key.
  if (method !== 'GET') headers['Idempotency-Key'] = crypto.randomUUID();
  const token = await getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
  } catch (e) {
    const timedOut = e instanceof DOMException && e.name === 'TimeoutError';
    throw new ApiError(0, timedOut ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR', null);
  }

  if (!res.ok) {
    let code = res.status === 401 ? 'UNAUTHORIZED' : res.status === 403 ? 'FORBIDDEN' : 'REQUEST_FAILED';
    try {
      const err = await res.json();
      code = err.code ?? err.error ?? code;
    } catch { /* non-JSON error body */ }
    throw new ApiError(res.status, code, res.headers.get('X-Correlation-Id'));
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
