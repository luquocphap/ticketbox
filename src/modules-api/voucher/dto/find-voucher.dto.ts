import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class VoucherPaginatedDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @ApiProperty({ example: "1", required: false })
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @ApiProperty({ example: "3", required: false })
    pageSize?: number;

    @IsOptional()
    @ApiProperty({ example: "ph", required: false, description: "Từ khóa tìm kiếm code của voucher" })
    keyWord!: string
}