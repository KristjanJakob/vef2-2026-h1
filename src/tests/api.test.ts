import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

let adminToken = '';
let categoryId = '';
let locationId = '';

describe('API', () => {
  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    expect(loginRes.status).toBe(200);
    adminToken = loginRes.body.token;

    const categoriesRes = await request(app).get('/categories');
    expect(categoriesRes.status).toBe(200);
    categoryId = categoriesRes.body.data[0].id;

    const locationsRes = await request(app).get('/locations');
    expect(locationsRes.status).toBe(200);
    locationId = locationsRes.body.data[0].id;
  });

  it('GET /events returns paginated list', async () => {
    const res = await request(app).get('/events?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('page', 1);
  });

  it('POST /auth/login returns token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
  });

  it('POST /admin/events requires auth and accepts data', async () => {
    const res = await request(app)
      .post('/admin/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Test event from vitest',
        description: 'This is created during automated tests.',
        startsAt: '2026-03-10T20:00:00.000Z',
        categoryId,
        locationId,
        status: 'PUBLISHED',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('GET /events/:id returns 404 for non-existing id', async () => {
    const res = await request(app).get('/events/not-a-real-uuid');
    expect([400, 404]).toContain(res.status);
  });
});