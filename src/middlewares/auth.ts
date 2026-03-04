import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';

export type AuthedRequest = Request & {
  user?: { id: string; role: 'USER' | 'ADMIN' };
};

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
}