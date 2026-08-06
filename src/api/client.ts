export class ApiError extends Error {
  public code: string;
  public details?: Record<string, unknown>;

  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `/api${path}`;
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new ApiError(`HTTP Error: ${response.status} ${response.statusText}`, 'UNKNOWN_ERROR');
    }

    if (errorData && errorData.error) {
      throw new ApiError(
        errorData.error.message || 'API request failed',
        errorData.error.code || 'UNKNOWN_ERROR',
        errorData.error.details
      );
    }
    throw new ApiError(`HTTP Error: ${response.status} ${response.statusText}`, 'UNKNOWN_ERROR');
  }

  // Handle empty 204 responses or empty body
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
