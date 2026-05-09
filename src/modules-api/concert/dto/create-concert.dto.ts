import { IsString, IsNotEmpty, IsDateString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateConcertDto {
    @ApiProperty({ example: 'Anh Trai Vượt Ngàn Chông Gai' })
    @IsString()
    @IsNotEmpty()
    title!: string

    @ApiProperty({ example: 'Sân vận động Mỹ Đình, Hà Nội' })
    @IsString()
    @IsNotEmpty()
    venue!: string

    @ApiProperty({ example: '2025-12-31T19:00:00.000Z' })
    @IsDateString()
    @IsNotEmpty()
    event_date!: string
}