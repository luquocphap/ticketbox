import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import type { users } from '@prisma/client';
import { User } from 'src/common/decorators/user.decorator';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Permission } from 'src/common/decorators/permission.decorator';
import { IdempotencyInterceptor } from 'src/common/interceptors/idempotency.interceptor';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Permission("CREATE", "BOOKING")
  @UseInterceptors(IdempotencyInterceptor)
  create(@User() user: users, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.createBooking(user.id, createBookingDto);
  }

  @Get()
  findAll(@User() user: users) {
    return this.bookingService.getMyBookings(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.getBookingById(id);
  }

  @Patch(':id/status')
  updateStatus(@User() user: users, @Param('id') id: string, @Body() updateBookingDto: UpdateBookingStatusDto) {
    return this.bookingService.updateStatus(id, updateBookingDto, user.id);
  }
}
