import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class QueryPaginatedDto {
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
    @ApiProperty({ example: "ph", required: false })
    keyWord!: string
}