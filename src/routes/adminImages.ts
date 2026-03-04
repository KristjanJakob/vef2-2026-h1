import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma';
import { cloudinary } from '../lib/cloudinary';
import { requireAuth, requireAdmin } from '../middlewares/auth';

export const adminImagesRouter = Router();

adminImagesRouter.use(requireAuth, requireAdmin);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

function isAllowedMime(mime: string) {
  return mime === 'image/jpeg' || mime === 'image/png';
}

adminImagesRouter.post(
  '/events/:id/images',
  upload.single('file'),
  async (req, res, next) => {
    try {
      const eventId = req.params.id;

      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) return res.status(404).json({ error: 'Not found' });

      if (!req.file) {
        return res.status(400).json({ error: 'Missing file (field name must be "file")' });
      }

      if (!isAllowedMime(req.file.mimetype)) {
        return res.status(400).json({ error: 'Only image/jpeg and image/png are allowed' });
      }

      const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'vef2-h1-events',
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve({ secure_url: result.secure_url, public_id: result.public_id });
          },
        );

        stream.end(req.file.buffer);
      });

      const img = await prisma.eventImage.create({
        data: {
          eventId,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          mimeType: req.file.mimetype,
        },
      });

      return res.status(201).json(img);
    } catch (e) {
      next(e);
    }
  },
);