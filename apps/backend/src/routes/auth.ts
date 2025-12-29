import { Router } from 'express';
import { prisma } from '../prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { LoginSchema } from '../../../../packages/shared/src/index';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

router.post('/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const { username, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  res.cookie('app_token', token, { httpOnly: true });
  res.json({ ok: true, user: { id: user.id, username: user.username, role: user.role } });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('app_token');
  res.json({ ok: true });
});

router.get('/me', async (req, res) => {
  const token = req.cookies['app_token'] || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: 'Not found' });
    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
