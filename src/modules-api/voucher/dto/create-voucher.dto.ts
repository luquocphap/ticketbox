import { IsString, IsNotEmpty, IsEnum, IsNumber, IsDateString, IsPositive, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

enum DiscountType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED_AMOUNT = 'FIXED_AMOUNT'
}

export class CreateVoucherDto {
    @ApiProperty({ example: 'SUMMER2025' })
    @IsString()
    @IsNotEmpty()
    code!: string

    @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
    @IsEnum(DiscountType)
    discount_type!: DiscountType

    @ApiProperty({ example: 10, description: 'Phần trăm hoặc số tiền giảm' })
    @IsNumber()
    @IsPositive()
    discount_value!: number

    @ApiProperty({ example: 100, description: 'Số lượt dùng tối đa' })
    @IsNumber()
    @Min(1)
    max_usage!: number

    @ApiProperty({ example: '2025-12-31T23:59:59.000Z' })
    @IsDateString()
    expired_at!: string
}