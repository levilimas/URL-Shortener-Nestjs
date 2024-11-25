import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UrlsService } from './urls.service';
import { UrlEntity } from '../../../core/domain/entities/url.entity';
import { NotFoundException } from '@nestjs/common';

describe('UrlsService', () => {
  let service: UrlsService;
  let repository: Repository<UrlEntity>;
  let configService: ConfigService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    increment: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
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
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
    repository = module.get<Repository<UrlEntity>>(getRepositoryToken(UrlEntity));
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new shortened URL', async () => {
      const createUrlDto = {
        originalUrl: 'https://example.com/long-url',
      };

      const newUrl = {
        id: '1',
        originalUrl: createUrlDto.originalUrl,
        shortCode: 'abc123',
        clicks: 0,
      };

      mockRepository.create.mockReturnValue(newUrl);
      mockRepository.save.mockResolvedValue(newUrl);

      const result = await service.create(createUrlDto);

      expect(result).toEqual(newUrl);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findByShortCode', () => {
    it('should return URL when found', async () => {
      const url = {
        id: '1',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
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
    it('should increment clicks counter', async () => {
      await service.incrementClicks('abc123');

      expect(mockRepository.increment).toHaveBeenCalledWith(
        { shortCode: 'abc123', deletedAt: null },
        'clicks',
        1,
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