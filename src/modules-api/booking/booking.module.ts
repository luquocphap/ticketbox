import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { InventoryService } from './inventory.service';

@Module({
  controllers: [BookingController],
  providers: [BookingService, InventoryService],
})
export class BookingModule {}
