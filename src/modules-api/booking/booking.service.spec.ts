import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { BookingService } from './booking.service';
import { InventoryService } from './inventory.service';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';

describe('BookingService', () => {
  let service: BookingService;
  let prismaService: jest.Mocked<PrismaService>;
  let inventoryService: jest.Mocked<InventoryService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            bookings: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            booking_status_history: {
              create: jest.fn(),
            },
            ticket_categories: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            vouchers: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: InventoryService,
          useValue: {
            reserveTickets: jest.fn(),
            releaseTickets: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    inventoryService = module.get(
      InventoryService,
    ) as jest.Mocked<InventoryService>;
  });

  describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      const userId = 'user1';
      const createBookingDto = {
        ticketCategoryId: 'cat1',
        quantity: 2,
        idempotencyKey: 'key123',
      };

      const mockCategory = { id: 'cat1', price: 100 };
      const mockBooking = { id: 'booking1', status: 'PENDING' };

      // Mock transaction
      prismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          ticket_categories: {
            findUnique: jest.fn().mockResolvedValue(mockCategory),
            update: jest.fn(),
          },
          bookings: {
            create: jest.fn().mockResolvedValue(mockBooking),
          },
          booking_status_history: {
            create: jest.fn(),
          },
          vouchers: { findUnique: jest.fn() },
        };
        return callback(tx);
      });

      inventoryService.reserveTickets.mockResolvedValue(void 0);

      const result = await service.createBooking(userId, createBookingDto as any);

      expect(result).toBeDefined();
      expect(inventoryService.reserveTickets).toHaveBeenCalled();
    });

    it('should throw error when category not found', async () => {
      const userId = 'user1';
      const createBookingDto = {
        ticketCategoryId: 'invalid',
        quantity: 2,
        idempotencyKey: 'key123',
      };

      prismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          ticket_categories: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
          vouchers: { findUnique: jest.fn() },
        };
        return callback(tx);
      });

      inventoryService.reserveTickets.mockResolvedValue(void 0);

      await expect(
        service.createBooking(userId, createBookingDto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getBookingById', () => {
    it('should return booking details', async () => {
      const booking = {
        id: 'booking1',
        status: 'PENDING',
        ticket_categories: { id: 'cat1', price: 100 },
      };

      prismaService.bookings.findUnique.mockResolvedValue(booking as any);

      const result = await service.getBookingById('booking1');

      expect(result).toEqual(booking);
      expect(prismaService.bookings.findUnique).toHaveBeenCalledWith({
        where: { id: 'booking1' },
        include: {
          ticket_categories: true,
          vouchers: true,
          booking_status_history: { orderBy: { createdAt: 'asc' } },
        },
      });
    });

    it('should throw error when booking not found', async () => {
      prismaService.bookings.findUnique.mockResolvedValue(null);

      await expect(service.getBookingById('invalid')).rejects.toThrow(
        'Booking không tồn tại',
      );
    });
  });

  describe('getMyBookings', () => {
    it('should return user bookings', async () => {
      const bookings = [
        { id: 'booking1', status: 'PENDING' },
        { id: 'booking2', status: 'CONFIRMED' },
      ];

      prismaService.bookings.findMany.mockResolvedValue(bookings as any);

      const result = await service.getMyBookings('user1');

      expect(result).toEqual(bookings);
      expect(prismaService.bookings.findMany).toHaveBeenCalledWith({
        where: { user_id: 'user1', isDeleted: false },
        include: { ticket_categories: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('updateStatus', () => {
    it('should update booking status', async () => {
      const booking = { id: 'booking1', status: 'PENDING' };
      const updateDto = { status: 'CONFIRMED', note: 'Payment received' };

      prismaService.bookings.findUnique.mockResolvedValue(booking as any);
      prismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          bookings: {
            update: jest.fn().mockResolvedValue({ ...booking, status: 'CONFIRMED' }),
          },
          booking_status_history: {
            create: jest.fn(),
          },
        };
        return callback(tx);
      });

      const result = await service.updateStatus('booking1', updateDto as any, 'operator1');

      expect(result).toBeDefined();
    });
  });
});
