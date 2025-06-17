import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

const router = express.Router();
registerRoutes(router);
app.use(router);

app.listen(PORT, () => {
  console.log(`🚀 Servidor Sistema de Finanzas ejecutándose en puerto ${PORT}`);
});
