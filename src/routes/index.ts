import { Router } from 'express';
import { eventsRouter } from './events';
import { authRouter } from './auth';
import { adminEventsRouter } from './adminEvents';
import { metaRouter } from './meta';


export const routes = Router();

routes.get('/', (_req, res) => {
  res.json({
    routes: [
      { method: 'GET', path: '/', description: 'List all routes' },
      { method: 'GET', path: '/health', description: 'Health check' },

      { method: 'POST', path: '/auth/register', description: 'Register user' },
      { method: 'POST', path: '/auth/login', description: 'Login and get JWT' },
      { method: 'GET', path: '/auth/me', description: 'Get current user (auth)' },

      { method: 'GET', path: '/events', description: 'List events (paginated)' },
      { method: 'GET', path: '/events/:id', description: 'Get one event' },

      { method: 'POST', path: '/admin/events', description: 'Create event (admin)' },
      { method: 'PATCH', path: '/admin/events/:id', description: 'Update event (admin)' },
      { method: 'DELETE', path: '/admin/events/:id', description: 'Delete event (admin)' },

      { method: 'GET', path: '/categories', description: 'List categories' },
      { method: 'GET', path: '/locations', description: 'List locations' },
    ],
  });
});

routes.get('/health', (_req, res) => res.json({ ok: true }));

routes.use('/auth', authRouter);
routes.use('/events', eventsRouter);
routes.use('/admin/events', adminEventsRouter);
routes.use('/', metaRouter);