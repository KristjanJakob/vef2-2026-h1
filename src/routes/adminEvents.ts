import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requireAdmin, type AuthedRequest } from '../middlewares/auth';

export const adminEventsRouter = Router();

adminEventsRouter.use(requireAuth, requireAdmin);

const createEventSchema = z.object({
  title: z.string().min(3).max(120).transform((s) => s.trim()),
  description: z.string().min(10).max(5000).transform((s) => s.trim()),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  categoryId: z.string().uuid(),
  locationId: z.string().uuid(),
  status: z.enum(['PUBLISHED', 'DRAFT']).optional(),
});

adminEventsRouter.post('/', async (req: AuthedRequest, res, next) => {
  try {
    const parsed = createEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation error',
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;

    const startsAt = new Date(data.startsAt);
    const endsAt = data.endsAt ? new Date(data.endsAt) : undefined;

    if (endsAt && endsAt < startsAt) {
      return res.status(400).json({ error: 'endsAt cannot be before startsAt' });
    }

    const [category, location] = await Promise.all([
      prisma.category.findUnique({ where: { id: data.categoryId } }),
      prisma.location.findUnique({ where: { id: data.locationId } }),
    ]);

    if (!category) return res.status(404).json({ error: 'Category not found' });
    if (!location) return res.status(404).json({ error: 'Location not found' });

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startsAt,
        endsAt,
        status: data.status ?? 'PUBLISHED',
        categoryId: data.categoryId,
        locationId: data.locationId,
        userId: req.user!.id,
      },
      include: { category: true, location: true, images: true },
    });

    return res.status(201).json(event);
  } catch (e) {
    next(e);
  }
});

const patchEventSchema = z.object({
  title: z.string().min(3).max(120).transform((s) => s.trim()).optional(),
  description: z.string().min(10).max(5000).transform((s) => s.trim()).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  categoryId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  status: z.enum(['PUBLISHED', 'DRAFT']).optional(),
});

adminEventsRouter.patch('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;

    const exists = await prisma.event.findUnique({ where: { id } });
    if (!exists) return res.status(404).json({ error: 'Not found' });

    const parsed = patchEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation error',
        fields: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;

    if (data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!category) return res.status(404).json({ error: 'Category not found' });
    }

    if (data.locationId) {
      const location = await prisma.location.findUnique({ where: { id: data.locationId } });
      if (!location) return res.status(404).json({ error: 'Location not found' });
    }

    const startsAt = data.startsAt ? new Date(data.startsAt) : undefined;
    const endsAt = data.endsAt ? new Date(data.endsAt) : undefined;

    if (startsAt && endsAt && endsAt < startsAt) {
      return res.status(400).json({ error: 'endsAt cannot be before startsAt' });
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...data,
        startsAt,
        endsAt,
      },
      include: { category: true, location: true, images: true },
    });

    return res.json(updated);
  } catch (e) {
    next(e);
  }
});

adminEventsRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;

    const exists = await prisma.event.findUnique({ where: { id } });
    if (!exists) return res.status(404).json({ error: 'Not found' });

    await prisma.event.delete({ where: { id } });
    return res.status(204).send();
  } catch (e) {
    next(e);
  }
});