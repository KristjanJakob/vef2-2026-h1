import { Router } from 'express';

export const routes = Router();

routes.get('/', (_req, res) => {
  res.json({
    routes: [
      { method: 'GET', path: '/', description: 'List all routes' },
      { method: 'GET', path: '/health', description: 'Health check' }
    ]
  });
});

routes.get('/health', (_req, res) => {
  res.json({ ok: true });
});