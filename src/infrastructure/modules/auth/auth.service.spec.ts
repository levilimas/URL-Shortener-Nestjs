import { Test, TestingModule } from '@nestjs/testing';
import * as jest from 'jest-mock';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const createdUser = {
        id: '1',
        ...registerDto,
        password: 'hashedPassword',
      };

      mockUsersService.create.mockResolvedValue(createdUser);
      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        user: createdUser,
        token: 'jwt_token',
      });
      expect(mockUsersService.create).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should return token when credentials are valid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        id: '1',
        email: loginDto.email,
        password: 'hashedPassword',
        validatePassword: jest.fn().mockResolvedValue(true),
      };

      mockUsersService.findByEmail.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        user,
        token: 'jwt_token',
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const user = {
        validatePassword: jest.fn().mockResolvedValue(false),
      };

      mockUsersService.findByEmail.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});