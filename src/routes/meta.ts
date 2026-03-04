import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const metaRouter = Router();

metaRouter.get('/categories', async (_req, res, next) => {
  try {
    const data = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

metaRouter.get('/locations', async (_req, res, next) => {
  try {
    const data = await prisma.location.findMany({ orderBy: { name: 'asc' } });
    res.json({ data });
  } catch (e) {
    next(e);
  }
});