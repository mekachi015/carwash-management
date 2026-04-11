export const API_BASE = import.meta.env.VITE_API_URL || '';

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
 
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
 
  const response = await fetch(url, config);
 
  if (!response.ok) {
    // Try to read the error message the Spring Boot GlobalExceptionHandler sent back
    let message = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (body.message) message = body.message;
    } catch {
      // response body was not JSON — keep the default message
    }
    throw new Error(message);
  }
 
  // 204 No Content (DELETE) has no body
  if (response.status === 204) return null;
 
  return response.json();
}