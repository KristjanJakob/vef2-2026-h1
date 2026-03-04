import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const eventsRouter = Router();

eventsRouter.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limitRaw = Number(req.query.limit ?? 10);
    const limit = Math.min(50, Math.max(1, limitRaw));

    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      prisma.event.count(),
      prisma.event.findMany({
        orderBy: { startsAt: 'asc' },
        skip,
        take: limit,
        include: {
          category: true,
          location: true,
          images: true,
        },
      }),
    ]);

    res.json({
      page,
      limit,
      total,
      hasNext: skip + data.length < total,
      data,
    });
  } catch (e) {
    next(e);
  }

  eventsRouter.get('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
  
      const event = await prisma.event.findUnique({
        where: { id },
        include: { category: true, location: true, images: true },
      });
  
      if (!event) {
        return res.status(404).json({ error: 'Not found' });
      }
  
      return res.json(event);
    } catch (e) {
      next(e);
    }
  });
});