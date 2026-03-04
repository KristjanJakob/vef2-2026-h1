import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { requireAuth, type AuthedRequest } from '../middlewares/auth';

export const authRouter = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/),
  password: z.string().min(6).max(200),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

authRouter.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation error',
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    const username = parsed.data.username.trim().toLowerCase();
    const password = parsed.data.password;

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hash,
        role: 'USER',
      },
      select: { id: true, username: true, role: true, createdAt: true },
    });

    return res.status(201).json(user);
  } catch (e) {
    next(e);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation error',
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    const username = parsed.data.username.trim().toLowerCase();
    const password = parsed.data.password;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = signToken({ sub: user.id, role: user.role });

    return res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (e) {
    next(e);
  }
});

authRouter.get('/me', requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, role: true, createdAt: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.json(user);
  } catch (e) {
    next(e);
  }
});