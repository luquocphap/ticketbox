// booking/services/inventory.service.ts
import { Injectable, ConflictException } from '@nestjs/common'
import { PrismaService } from 'src/modules-system/prisma/prisma.service'

@Injectable()
export class InventoryService {
    constructor(private readonly prisma: PrismaService) {}

    // Dùng trong transaction — không gọi độc lập
    async reserveTickets(
        tx: Omit<PrismaService, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
        categoryId: string,
        qty: number
    ): Promise<void> {
        // Raw query để lock row (SELECT FOR UPDATE)
        const result = await tx.$queryRaw<{ available_quantity: number }[]>`
            SELECT available_quantity
            FROM ticket_categories
            WHERE id = ${categoryId}
            FOR UPDATE
        `

        if (!result.length) {
            throw new ConflictException('Ticket category không tồn tại')
        }

        if (result[0].available_quantity < qty) {
            throw new ConflictException('Vé đã hết hoặc không đủ số lượng')
        }

        await tx.ticket_categories.update({
            where: { id: categoryId },
            data: { available_quantity: { decrement: qty } }
        })
    }

    async releaseTickets(categoryId: string, qty: number): Promise<void> {
        await this.prisma.ticket_categories.update({
            where: { id: categoryId },
            data: { available_quantity: { increment: qty } }
        })
    }
}