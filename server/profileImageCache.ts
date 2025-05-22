/**
 * Módulo de caché para imágenes de perfil
 * 
 * Este módulo proporciona una forma de almacenar y recuperar las URLs de imágenes de perfil
 * sin necesidad de modificar la estructura de la base de datos.
 */

// Caché de imágenes de perfil (userId -> imageUrl)
const profileImageCache: Map<number, string> = new Map();

/**
 * Guarda la URL de imagen de perfil para un usuario
 */
export function saveProfileImage(userId: number, imageUrl: string): void {
  profileImageCache.set(userId, imageUrl);
}

/**
 * Obtiene la URL de imagen de perfil para un usuario
 */
export function getProfileImage(userId: number): string | undefined {
  return profileImageCache.get(userId);
}

/**
 * Elimina la URL de imagen de perfil para un usuario
 */
export function removeProfileImage(userId: number): void {
  profileImageCache.delete(userId);
}

/**
 * Obtiene todas las URLs de imágenes de perfil
 */
export function getAllProfileImages(): Record<number, string> {
  const result: Record<number, string> = {};
  profileImageCache.forEach((url, userId) => {
    result[userId] = url;
  });
  return result;
}