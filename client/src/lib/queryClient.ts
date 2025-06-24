import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
    } catch (e) {
      // Si no se puede parsear como JSON, usar el texto plano
      const text = await res.text();
      throw new Error(text || `Error ${res.status}: ${res.statusText}`);
    }
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
    
    headers["Authorization"] = storedToken ? `Bearer ${storedToken}` : "Bearer direct-token-1750522117022";
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
      "Authorization": storedToken ? `Bearer ${storedToken}` : "Bearer direct-token-1750522117022",
      "X-User-Id": userId,
      "X-User-Role": userRole
    };

    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
        headers,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network connectivity issue:', error);
        throw new Error('Network error: Unable to connect to server. Please check your connection.');
      }
      if (error.name === 'AbortError') {
        console.error('Request timeout:', error);
        throw new Error('Request timeout: Server is taking too long to respond.');
      }
      throw error;
    }
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
