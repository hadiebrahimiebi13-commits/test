import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import pino from 'pino';
import { prisma } from './prisma';
import authRoutes from './routes/auth';
import nodesRoutes from './routes/nodes';
import { openapi } from './openapi';
import casesRoutes from './routes/cases';

const logger = pino();
const app = express();
const PORT = process.env.PORT_BACKEND ? Number(process.env.PORT_BACKEND) : 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/nodes', nodesRoutes);
app.use('/cases', casesRoutes);

app.get('/docs', (_req, res) => res.json(openapi));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, async () => {
  logger.info({ port: PORT }, 'Backend listening');
  try {
    await prisma.$connect();
    logger.info('Connected to DB');
  } catch (err) {
    logger.error(err, 'DB connect error');
  }
});
