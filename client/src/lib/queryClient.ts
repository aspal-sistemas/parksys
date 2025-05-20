import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string, 
  options: {
    method?: string;
    data?: unknown;
    headers?: Record<string, string>;
  } = {}
): Promise<Response> {
  // Para la ruta de inicio de sesión no queremos enviar credenciales predeterminadas
  const isLoginRequest = url === '/api/login';
  const method = options.method || 'GET';
  const data = options.data;
  
  // Añadimos un token de autenticación para desarrollo excepto para login
  let headers: Record<string, string> = {
    ...options.headers
  };
  
  // Solo agregamos las cabeceras de autorización si no es una petición de login
  if (!isLoginRequest) {
    headers["Authorization"] = "Bearer direct-token-admin";
    headers["X-User-Id"] = "1"; // Este es el ID del usuario admin
    headers["X-User-Role"] = "super_admin"; // Asignamos rol de super_admin para tener todos los permisos
  }
  
  // Solo añadimos Content-Type JSON si no es FormData
  if (data && !(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Preparamos el cuerpo de la petición
  let body = undefined;
  if (data) {
    if (data instanceof FormData) {
      body = data;
    } else {
      body = JSON.stringify(data);
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
    credentials: "include",
  });

  // No lanzamos errores para peticiones de login, permitimos manejarlas en el componente
  if (!isLoginRequest) {
    await throwIfResNotOk(res);
  }
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
