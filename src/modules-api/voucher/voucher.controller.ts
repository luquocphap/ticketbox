import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { Permission } from 'src/common/decorators/permission.decorator';
import type { users } from '@prisma/client';
import { User } from 'src/common/decorators/user.decorator';
import { VoucherPaginatedDto } from './dto/find-voucher.dto';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post()
  @Permission("CREATE", "VOUCHER")
  create(@User() user: users, @Body() createVoucherDto: CreateVoucherDto) {
    return this.voucherService.create(user.id, createVoucherDto);
  }

  @Get()
  @Permission("READ", "VOUCHER")
  findAll(@Query() query: VoucherPaginatedDto) {
    return this.voucherService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('code') code: string) {
    return this.voucherService.findOne(code);
  }
}
