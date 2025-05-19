import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string, 
  options?: {
    method?: string;
    data?: unknown;
  }
): Promise<Response> {
  const method = options?.method || 'GET';
  const data = options?.data;

  // Añadimos un token de autenticación para desarrollo
  const headers: Record<string, string> = {
    ...data ? { "Content-Type": "application/json" } : {},
    "Authorization": "Bearer direct-token-admin",
    "X-User-Id": "1", // Este es el ID del usuario admin
    "X-User-Role": "super_admin" // Asignamos rol de super_admin para tener todos los permisos
  };

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Añadimos encabezados de autenticación para desarrollo
    const headers: Record<string, string> = {
      "Authorization": "Bearer direct-token-admin",
      "X-User-Id": "1", // Este es el ID del usuario admin
      "X-User-Role": "super_admin" // Asignamos rol de super_admin para tener todos los permisos
    };

    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
