import { Request, Response, NextFunction } from 'express';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import candidateRoutes from './routes/candidateRoutes';

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

app.get('/', (_req, res) => {
  res.send('Hola LTI!');
});

app.use('/api/candidates', candidateRoutes);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Error interno del servidor' });
});

const port = process.env.PORT || 3010;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Servidor en http://localhost:${port}`);
  });
}
