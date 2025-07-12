import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function createViteServer() {
  const vite = await createServer({
    root: path.join(__dirname, '..', 'client'),
    server: {
      middlewareMode: true,
      hmr: false, // Disable HMR for production
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
    build: {
      rollupOptions: {
        external: ['react', 'react-dom'],
      },
    },
  });

  return vite;
}