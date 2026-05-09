import { Injectable } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import { VoucherPaginatedDto } from './dto/find-voucher.dto';
import { buildQueryVoucher } from 'src/common/helpers/build-query-voucher.helper';

@Injectable()
export class VoucherService {
  constructor(private prisma: PrismaService) {}
  async create(userId: string, createVoucherDto: CreateVoucherDto) {
    const { code, discount_type, discount_value, expired_at, max_usage } = createVoucherDto;
    
    await this.prisma.vouchers.create({
      data:{
        code: code,
        discount_type: discount_type,
        discount_value: discount_value,
        expired_at: expired_at,
        max_usage: max_usage,
        created_by: userId
      }
    })

    return true
  }

  async findAll(query: VoucherPaginatedDto) {
    const { index, page, pageSize, where } = buildQueryVoucher(query);

    const vouchersPromise = this.prisma.vouchers.findMany({
        where: where,
        skip: index,
        take: pageSize,
    })

    const totalVoucherPromise = this.prisma.concerts.count({
        where: where
    })

    const [vouchers, totalVoucher] = await Promise.all([vouchersPromise, totalVoucherPromise]);

    const totolPages = Math.ceil(totalVoucher / pageSize);

    return {
        currentPage: page,
        count: pageSize,
        totalPages: totolPages,
        totalCount: totalVoucher,
        items: vouchers
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} voucher`;
  }

  update(id: number, updateVoucherDto: UpdateVoucherDto) {
    return `This action updates a #${id} voucher`;
  }

  remove(id: number) {
    return `This action removes a #${id} voucher`;
  }
}
