import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';

describe('InventoryService', () => {
  let service: InventoryService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
            ticket_categories: {
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  describe('reserveTickets', () => {
    it('should successfully reserve tickets', async () => {
      const tx = {
        $queryRaw: jest.fn().mockResolvedValue([{ available_quantity: 10 }]),
        ticket_categories: {
          update: jest.fn(),
        },
      };

      await service.reserveTickets(tx as any, 'cat1', 5);

      expect(tx.ticket_categories.update).toHaveBeenCalledWith({
        where: { id: 'cat1' },
        data: { available_quantity: { decrement: 5 } },
      });
    });

    it('should throw error when insufficient tickets', async () => {
      const tx = {
        $queryRaw: jest.fn().mockResolvedValue([{ available_quantity: 2 }]),
      };

      await expect(
        service.reserveTickets(tx as any, 'cat1', 5),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw error when category not found', async () => {
      const tx = {
        $queryRaw: jest.fn().mockResolvedValue([]),
      };

      await expect(
        service.reserveTickets(tx as any, 'invalid', 5),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('releaseTickets', () => {
    it('should release tickets back to inventory', async () => {
      prismaService.ticket_categories.update.mockResolvedValue({} as any);

      await service.releaseTickets('cat1', 5);

      expect(prismaService.ticket_categories.update).toHaveBeenCalledWith({
        where: { id: 'cat1' },
        data: { available_quantity: { increment: 5 } },
      });
    });
  });
});
