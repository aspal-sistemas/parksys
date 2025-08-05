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
    // Intentar usar el token almacenado, o usar el token directo como respaldo
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    let userId = "1";
    let userRole = "super_admin";
    
    // Si hay un usuario almacenado, usamos su información
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        userId = userObj.id.toString();
        userRole = userObj.role || "admin";
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }
    
    headers["Authorization"] = storedToken ? `Bearer ${storedToken}` : "Bearer direct-token-admin";
    headers["X-User-Id"] = userId;
    headers["X-User-Role"] = userRole;
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
    // Obtener información de autenticación almacenada
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    let userId = "1";
    let userRole = "super_admin";
    
    // Si hay un usuario almacenado, usamos su información
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        userId = userObj.id.toString();
        userRole = userObj.role || "admin";
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }
    
    // Añadimos encabezados de autenticación
    const headers: Record<string, string> = {
      "Authorization": storedToken ? `Bearer ${storedToken}` : "Bearer direct-token-admin",
      "X-User-Id": userId,
      "X-User-Role": userRole
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
