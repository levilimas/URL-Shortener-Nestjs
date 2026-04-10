import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('URL Shortener (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdUrlId: string;
  let createdShortCode: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    app.setGlobalPrefix('api', {
      exclude: [{ path: ':shortCode', method: RequestMethod.GET }],
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const testUser = {
      email: `e2e-${Date.now()}@test.com`,
      password: 'Test@1234',
      name: 'E2E User',
    };

    it('POST /api/auth/register - should register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('email', testUser.email);
          authToken = res.body.token;
        });
    });

    it('POST /api/auth/login - should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('user');
        });
    });

    it('POST /api/auth/login - should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrong' })
        .expect(401);
    });
  });

  describe('URL Shortening (public)', () => {
    it('POST /api/shorten - should shorten a URL without auth', () => {
      return request(app.getHttpServer())
        .post('/api/shorten')
        .send({ originalUrl: 'https://example.com/a-very-long-url-path' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('shortUrl');
          expect(res.body).toHaveProperty('shortCode');
          expect(res.body).toHaveProperty('originalUrl');
          expect(res.body.shortCode.length).toBeLessThanOrEqual(6);
        });
    });
  });

  describe('URL Operations (authenticated)', () => {
    it('POST /api/urls - should create a short URL for the user', () => {
      return request(app.getHttpServer())
        .post('/api/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ originalUrl: 'https://example.com/authenticated-url' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('shortUrl');
          expect(res.body).toHaveProperty('shortCode');
          createdUrlId = res.body.id;
          createdShortCode = res.body.shortCode;
        });
    });

    it('GET /api/urls - should list user URLs with click count', () => {
      return request(app.getHttpServer())
        .get('/api/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(1);
          expect(res.body[0]).toHaveProperty('clicks');
        });
    });

    it('PUT /api/urls/:id - should update the original URL', () => {
      return request(app.getHttpServer())
        .put(`/api/urls/${createdUrlId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ originalUrl: 'https://example.com/updated-url' })
        .expect(200)
        .expect((res) => {
          expect(res.body.originalUrl).toBe('https://example.com/updated-url');
        });
    });

    it('DELETE /api/urls/:id - should soft delete the URL', () => {
      return request(app.getHttpServer())
        .delete(`/api/urls/${createdUrlId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('GET /api/urls - deleted URL should not appear', () => {
      return request(app.getHttpServer())
        .get('/api/urls')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          const found = res.body.find((u: any) => u.id === createdUrlId);
          expect(found).toBeUndefined();
        });
    });
  });

  describe('Redirect', () => {
    let shortCode: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/shorten')
        .send({ originalUrl: 'https://example.com/redirect-test' });
      shortCode = res.body.shortCode;
    });

    it('GET /:shortCode - should redirect to original URL', () => {
      return request(app.getHttpServer())
        .get(`/${shortCode}`)
        .expect(302)
        .expect('Location', 'https://example.com/redirect-test');
    });

    it('GET /:shortCode - should return 404 for unknown code', () => {
      return request(app.getHttpServer()).get('/nonExistent').expect(404);
    });
  });
});
