import {
    Injectable, NotFoundException,
    UnprocessableEntityException, Logger,
    BadRequestException
} from '@nestjs/common'
import { CreateBookingDto } from './dto/create-booking.dto'
import { PrismaService } from 'src/modules-system/prisma/prisma.service'
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto'
import { InventoryService } from './inventory.service'

@Injectable()
export class BookingService {
    private readonly logger = new Logger(BookingService.name)

    constructor(
        private readonly prisma: PrismaService,
        private readonly inventoryService: InventoryService,
    ) {}

    async createBooking(userId: string, dto: CreateBookingDto) {
        const { ticketCategoryId, quantity, voucherCode, idempotencyKey } = dto

        return this.prisma.$transaction(async (tx) => {
            await this.inventoryService.reserveTickets(tx as any, ticketCategoryId, quantity)

            const category = await tx.ticket_categories.findUnique({
                where: { id: ticketCategoryId }
            })

            if (!category) throw new BadRequestException("This Category ticket does not exist");

            let totalPrice = Number(category.price) * quantity
            let discountAmount = 0
            let voucherId: string | null = null

            if (voucherCode) {
                const voucher = await tx.vouchers.findUnique({
                    where: { code: voucherCode }
                })

                if (!voucher || !voucher.is_active || voucher.used_count >= voucher.max_usage) {
                    throw new UnprocessableEntityException('Voucher không hợp lệ hoặc đã hết lượt dùng')
                }

                if (new Date() > voucher.expired_at) {
                    throw new UnprocessableEntityException('Voucher đã hết hạn')
                }

                discountAmount = voucher.discount_type === 'PERCENTAGE'
                    ? totalPrice * (Number(voucher.discount_value) / 100)
                    : Number(voucher.discount_value)

                discountAmount = Math.min(discountAmount, totalPrice)

                await tx.vouchers.update({
                    where: { id: voucher.id },
                    data: { used_count: { increment: 1 } }
                })

                voucherId = voucher.id
            }

            const booking = await tx.bookings.create({
                data: {
                    user_id: userId,
                    ticket_category_id: ticketCategoryId,
                    voucher_id: voucherId,
                    idempotency_key: idempotencyKey,
                    quantity,
                    total_price: totalPrice - discountAmount,
                    discount_amount: discountAmount,
                    status: 'PENDING'
                }
            })

            await tx.booking_status_history.create({
                data: {
                    booking_id: booking.id,
                    from_status: null,
                    to_status: 'PENDING',
                    changed_by: userId,
                    note: 'Booking khởi tạo'
                }
            })

            this.logger.log(`Booking created: ${booking.id} by user: ${userId}`)
            return booking
        })
    }

    async updateStatus(
        bookingId: string,
        updateBookingDto: UpdateBookingStatusDto,
        operatorId: string
    ) {
        const { status, note } = updateBookingDto;
        const booking = await this.prisma.bookings.findUnique({
            where: { id: bookingId }
        })

        if (!booking) throw new NotFoundException('Booking không tồn tại')

        const updated = await this.prisma.$transaction(async (tx) => {
            const result = await tx.bookings.update({
                where: { id: bookingId },
                data: { status: status }
            })

            await tx.booking_status_history.create({
                data: {
                    booking_id: bookingId,
                    from_status: booking.status,
                    to_status: status,
                    changed_by: operatorId,
                    note: note ?? null
                }
            })

            // Release inventory nếu huỷ
            if (status === 'CANCELLED' || status === 'EXPIRED') {
                await this.inventoryService.releaseTickets(booking.ticket_category_id, booking.quantity)
            }

            return result
        })

        return updated
    }

    async getBookingById(id: string) {
        const booking = await this.prisma.bookings.findUnique({
            where: { id },
            include: {
                ticket_categories: true,
                vouchers: true,
                booking_status_history: { orderBy: { createdAt: 'asc' } }
            }
        })

        if (!booking) throw new NotFoundException('Booking không tồn tại')
        return booking
    }

    async getMyBookings(userId: string) {
        return this.prisma.bookings.findMany({
            where: { user_id: userId, isDeleted: false },
            include: { ticket_categories: true },
            orderBy: { createdAt: 'desc' }
        })
    }
}