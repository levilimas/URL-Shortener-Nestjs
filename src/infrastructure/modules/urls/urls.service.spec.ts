import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UrlsService } from './urls.service';
import { QrCodeService } from './qr-code.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { PgBossService } from '../../queue/pg-boss.service';
import { RedisService } from '../../redis/redis.service';
import { UrlEntity } from '../../../domain/entities/url.entity';
import { NotFoundException } from '@nestjs/common';

describe('UrlsService', () => {
  let service: UrlsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    increment: jest.fn(),
    softRemove: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockQrCodeService = {
    generateQrCodeUrl: jest.fn(),
    generateStyledQrCodeUrl: jest.fn(),
  };

  const mockAnalyticsService = {
    recordClick: jest.fn(),
    buildClickSnapshot: jest.fn().mockReturnValue({
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent',
      referer: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
    }),
    getUrlAnalytics: jest.fn(),
    getUserAnalytics: jest.fn(),
  };

  const mockPgBossService = {
    enqueueClickAnalytics: jest.fn().mockResolvedValue(undefined),
  };

  const mockRedisService = {
    isReady: jest.fn().mockReturnValue(false),
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        {
          provide: getRepositoryToken(UrlEntity),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: QrCodeService,
          useValue: mockQrCodeService,
        },
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
        {
          provide: PgBossService,
          useValue: mockPgBossService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new shortened URL', async () => {
      const createUrlDto = { originalUrl: 'https://example.com/long-url' };
      const newUrl = {
        id: '1',
        originalUrl: createUrlDto.originalUrl,
        shortCode: 'abc123',
        clicks: 0,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(newUrl);
      mockRepository.save.mockResolvedValue(newUrl);

      const result = await service.create(createUrlDto);

      expect(result).toEqual(newUrl);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findByShortCode', () => {
    it('should return URL when found and accessible', async () => {
      const url = {
        id: '1',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        isAccessible: () => true,
        password: null,
      };

      mockRepository.findOne.mockResolvedValue(url);

      const result = await service.findByShortCode('abc123');
      expect(result).toEqual(url);
    });

    it('should throw NotFoundException when URL not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findByShortCode('notfound')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('incrementClicks', () => {
    it('should increment clicks counter and record analytics', async () => {
      const url = { id: 'url-1', shortCode: 'abc123' };
      const mockRequest = {
        headers: { 'user-agent': 'test-agent' },
        ip: '127.0.0.1',
      };

      mockRepository.findOne.mockResolvedValue(url);

      await service.incrementClicks('abc123', mockRequest);

      expect(mockRepository.increment).toHaveBeenCalledWith(
        { id: 'url-1' },
        'clicks',
        1,
      );
      expect(mockAnalyticsService.buildClickSnapshot).toHaveBeenCalledWith(
        mockRequest,
      );
      expect(mockPgBossService.enqueueClickAnalytics).toHaveBeenCalledWith({
        urlId: 'url-1',
        snapshot: expect.objectContaining({
          userAgent: 'test-agent',
          ipAddress: '127.0.0.1',
        }),
      });
    });
  });

  describe('delete', () => {
    it('should soft delete a URL owned by the user', async () => {
      const url = { id: '1', userId: 'user-1' };
      mockRepository.findOne.mockResolvedValue(url);
      mockRepository.softRemove.mockResolvedValue(url);

      await service.delete('1', 'user-1');

      expect(mockRepository.softRemove).toHaveBeenCalledWith(url);
    });

    it('should throw NotFoundException if URL not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('999', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getShortUrl', () => {
    it('should return complete short URL', () => {
      mockConfigService.get.mockReturnValue('http://localhost:3000');

      const result = service.getShortUrl('abc123');
      expect(result).toBe('http://localhost:3000/abc123');
    });
  });
});
