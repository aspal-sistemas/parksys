import { Request, Response, Router } from 'express';
import { handleProfileImageUpload } from './profileImageUpload';
import { saveProfileImage, getProfileImage, getAllProfileImages } from '../profileImageCache';

export function registerProfileImageEndpoints(app: any, apiRouter: Router) {
  // Endpoint para subir una imagen de perfil
  app.post('/api/upload/profile-image', async (req: Request, res: Response) => {
    handleProfileImageUpload(req, res);
  });

  // Endpoint para guardar la URL de la imagen de perfil de un usuario
  apiRouter.post('/users/:id/profile-image', async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ message: 'URL de imagen no proporcionada' });
      }
      
      // Guardar la URL en la caché
      saveProfileImage(userId, imageUrl);
      
      res.json({ 
        success: true, 
        message: 'URL de imagen de perfil guardada correctamente',
        userId,
        imageUrl
      });
    } catch (error) {
      console.error('Error al guardar la URL de imagen de perfil:', error);
      res.status(500).json({ 
        message: 'Error al guardar la URL de imagen de perfil',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Endpoint para obtener la URL de la imagen de perfil de un usuario
  apiRouter.get('/users/:id/profile-image', async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      
      // Obtener la URL de la caché
      const imageUrl = getProfileImage(userId);
      
      if (!imageUrl) {
        return res.status(404).json({ 
          message: 'No se encontró ninguna imagen de perfil para este usuario'
        });
      }
      
      res.json({ imageUrl });
    } catch (error) {
      console.error('Error al obtener la URL de imagen de perfil:', error);
      res.status(500).json({ 
        message: 'Error al obtener la URL de imagen de perfil',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  // Endpoint para obtener todas las imágenes de perfil
  apiRouter.get('/profile-images', async (req: Request, res: Response) => {
    try {
      // Obtener todas las URLs de la caché
      const images = getAllProfileImages();
      
      res.json({ images });
    } catch (error) {
      console.error('Error al obtener las URLs de imágenes de perfil:', error);
      res.status(500).json({ 
        message: 'Error al obtener las URLs de imágenes de perfil',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });
}