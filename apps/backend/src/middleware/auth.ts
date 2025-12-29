import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function requireAuth(role?: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies['app_token'] || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    try {
      const payload: any = jwt.verify(token, JWT_SECRET);
      if (role && payload.role !== role) return res.status(403).json({ error: 'Forbidden' });
      // attach user
      (req as any).user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
