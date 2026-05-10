// dto/update-booking-status.dto.ts
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateBookingStatusDto {
    @ApiProperty({ enum: ['CONFIRMED', 'CANCELLED', 'EXPIRED'] })
    @IsEnum(['CONFIRMED', 'CANCELLED', 'EXPIRED'])
    status!: 'CONFIRMED' | 'CANCELLED' | 'EXPIRED'

    @ApiPropertyOptional({ example: 'Xử lý ngoại lệ từ operator' })
    @IsString()
    @IsOptional()
    note?: string
}