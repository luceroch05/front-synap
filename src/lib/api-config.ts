/**
 * Configuración del API
 * La URL se obtiene de las variables de entorno
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Función helper para hacer peticiones al backend
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  // Si es 204 No Content, no intentar parsear JSON
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}
