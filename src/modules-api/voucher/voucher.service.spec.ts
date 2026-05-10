import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import { buildQueryVoucher } from 'src/common/helpers/build-query-voucher.helper';

jest.mock('src/common/helpers/build-query-voucher.helper');

describe('VoucherService', () => {
  let service: VoucherService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoucherService,
        {
          provide: PrismaService,
          useValue: {
            vouchers: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
            },
            concerts: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<VoucherService>(VoucherService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  describe('create', () => {
    it('should create a new voucher', async () => {
      const createVoucherDto = {
        code: 'SUMMER2025',
        discount_type: 'PERCENTAGE',
        discount_value: 10,
        expired_at: new Date('2025-12-31'),
        max_usage: 100,
      };

      prismaService.vouchers.create.mockResolvedValue({} as any);

      const result = await service.create('user1', createVoucherDto as any);

      expect(result).toBe(true);
      expect(prismaService.vouchers.create).toHaveBeenCalledWith({
        data: {
          code: createVoucherDto.code,
          discount_type: createVoucherDto.discount_type,
          discount_value: createVoucherDto.discount_value,
          expired_at: createVoucherDto.expired_at,
          max_usage: createVoucherDto.max_usage,
          created_by: 'user1',
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated vouchers', async () => {
      const query = { page: 1, pageSize: 10 };
      const mockVouchers = [
        { id: '1', code: 'SUMMER2025', discount_type: 'PERCENTAGE' },
        { id: '2', code: 'WINTER2025', discount_type: 'FIXED' },
      ];

      (buildQueryVoucher as jest.Mock).mockReturnValue({
        index: 0,
        pageSize: 10,
        page: 1,
        where: {},
      });

      prismaService.vouchers.findMany.mockResolvedValue(mockVouchers as any);
      prismaService.vouchers.count.mockResolvedValue(2);

      const result = await service.findAll(query as any);

      expect(result.items).toEqual(mockVouchers);
      expect(result.totalCount).toBe(2);
      expect(result.currentPage).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a single voucher by code', async () => {
      const voucher = {
        id: '1',
        code: 'SUMMER2025',
        discount_type: 'PERCENTAGE',
        discount_value: 10,
      };

      prismaService.vouchers.findUnique.mockResolvedValue(voucher as any);

      const result = await service.findOne('SUMMER2025');

      expect(result).toEqual(voucher);
      expect(prismaService.vouchers.findUnique).toHaveBeenCalledWith({
        where: { code: 'SUMMER2025' },
      });
    });

    it('should throw error when voucher not found', async () => {
      prismaService.vouchers.findUnique.mockResolvedValue(null);

      await expect(service.findOne('INVALID')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
