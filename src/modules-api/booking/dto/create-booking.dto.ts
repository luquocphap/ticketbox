// booking/dto/create-booking.dto.ts
import { IsString, IsNotEmpty, IsInt, IsOptional, IsPositive, IsUUID } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateBookingDto {
    @ApiProperty({ example: 'uuid-of-ticket-category' })
    @IsUUID()
    @IsNotEmpty()
    ticketCategoryId!: string

    @ApiProperty({ example: 2 })
    @IsInt()
    @IsPositive()
    quantity!: number

    @ApiPropertyOptional({ example: 'SUMMER2025' })
    @IsString()
    @IsOptional()
    voucherCode?: string

    @ApiProperty({ description: 'UUID v4 do client sinh, dùng để chống duplicate submit' })
    @IsUUID('4')
    idempotencyKey!: string
}