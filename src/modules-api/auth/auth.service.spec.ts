import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import { TokenService } from 'src/modules-system/token/token.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            roles: { findMany: jest.fn() },
            users: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: TokenService,
          useValue: {
            createAccessToken: jest.fn(),
            createRefreshToken: jest.fn(),
            verifyAccessToken: jest.fn(),
            verifyRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    tokenService = module.get(TokenService) as jest.Mocked<TokenService>;
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        email: 'test@gmail.com',
        full_name: 'Test User',
        password: 'Password123!',
      };

      prismaService.users.findUnique.mockResolvedValue(null);
      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashedPassword');
      prismaService.users.create.mockResolvedValue({} as any);

      const result = await service.register(registerDto);

      expect(result).toBe(true);
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hashSync).toHaveBeenCalledWith(registerDto.password, 10);
    });

    it('should throw error when email already exists', async () => {
      const registerDto = {
        email: 'existing@gmail.com',
        full_name: 'Test User',
        password: 'Password123!',
      };

      prismaService.users.findUnique.mockResolvedValue({ id: '1' } as any);

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should successfully login and return tokens', async () => {
      const loginDto = {
        email: 'test@gmail.com',
        mat_khau: 'Password123!',
      };

      const user = { id: 'user1', password_hash: 'hashedPassword' };
      prismaService.users.findUnique.mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      tokenService.createAccessToken.mockReturnValue('accessToken');
      tokenService.createRefreshToken.mockReturnValue('refreshToken');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });

    it('should throw error when user not found', async () => {
      const loginDto = {
        email: 'notfound@gmail.com',
        mat_khau: 'Password123!',
      };

      prismaService.users.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTypeList', () => {
    it('should return list of user types', async () => {
      const mockTypes = [
        { loai_nguoi_dung: 'ADMIN', ten_loai: 'Administrator' },
        { loai_nguoi_dung: 'USER', ten_loai: 'Customer' },
      ];

      prismaService.roles.findMany.mockResolvedValue(mockTypes as any);

      const result = await service.getTypeList();

      expect(result).toEqual(mockTypes);
      expect(prismaService.roles.findMany).toHaveBeenCalled();
    });
  });
});
