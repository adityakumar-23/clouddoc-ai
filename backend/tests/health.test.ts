import request from 'supertest';
import { app } from '../src/app';

describe('GET /api/v1/health', () => {
  it('should return health status payload with 200 or 503', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBeDefined();
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('version', '1.0.0');
    expect(res.body).toHaveProperty('service', 'clouddoc-backend-api');
  });
});
