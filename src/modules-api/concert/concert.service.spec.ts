import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConcertService } from './concert.service';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import { buildQueryConcert } from 'src/common/helpers/build-query-concert.helper';

jest.mock('src/common/helpers/build-query-concert.helper');

describe('ConcertService', () => {
  let service: ConcertService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertService,
        {
          provide: PrismaService,
          useValue: {
            concerts: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ConcertService>(ConcertService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  describe('create', () => {
    it('should create a new concert', async () => {
      const user = { id: 'user1' } as any;
      const createConcertDto = {
        title: 'Concert 2025',
        event_date: '2025-12-31T19:00:00Z',
        venue: 'Stadium A',
      };

      prismaService.concerts.create.mockResolvedValue({} as any);

      const result = await service.create(user, createConcertDto);

      expect(result).toBe(true);
      expect(prismaService.concerts.create).toHaveBeenCalledWith({
        data: {
          title: createConcertDto.title,
          event_date: createConcertDto.event_date,
          venue: createConcertDto.venue,
          created_by: user.id,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated concerts', async () => {
      const query = { page: 1, pageSize: 10 };
      const mockConcerts = [
        { id: '1', title: 'Concert 1', venue: 'Stadium A' },
        { id: '2', title: 'Concert 2', venue: 'Stadium B' },
      ];

      (buildQueryConcert as jest.Mock).mockReturnValue({
        index: 0,
        pageSize: 10,
        page: 1,
        where: { isDeleted: false },
      });

      prismaService.concerts.findMany.mockResolvedValue(mockConcerts as any);
      prismaService.concerts.count.mockResolvedValue(2);

      const result = await service.findAll(query as any);

      expect(result.items).toEqual(mockConcerts);
      expect(result.totalCount).toBe(2);
      expect(result.currentPage).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a single concert', async () => {
      const concert = {
        id: '1',
        title: 'Concert 1',
        venue: 'Stadium A',
      };

      prismaService.concerts.findUnique.mockResolvedValue(concert as any);

      const result = await service.findOne('1');

      expect(result).toEqual(concert);
      expect(prismaService.concerts.findUnique).toHaveBeenCalledWith({
        where: { id: '1', isDeleted: false },
      });
    });

    it('should throw error when concert not found', async () => {
      prismaService.concerts.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a concert', async () => {
      const updateConcertDto = {
        title: 'Updated Concert',
        event_date: '2025-12-31T19:00:00Z',
        venue: 'Stadium B',
      };

      prismaService.concerts.findUnique.mockResolvedValue({
        id: '1',
      } as any);
      prismaService.concerts.update.mockResolvedValue({} as any);

      const result = await service.update('1', updateConcertDto);

      expect(result).toBe(true);
      expect(prismaService.concerts.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateConcertDto,
      });
    });
  });

  describe('remove', () => {
    it('should soft delete a concert', async () => {
      const concert = { id: '1', title: 'Concert' };
      prismaService.concerts.findUnique.mockResolvedValue(concert as any);
      prismaService.concerts.update.mockResolvedValue({} as any);

      const result = await service.remove('user1', '1');

      expect(result).toBe(true);
      expect(prismaService.concerts.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          isDeleted: true,
          deletedBy: 'user1',
          deletedAt: expect.any(Date),
        },
      });
    });
  });
});
