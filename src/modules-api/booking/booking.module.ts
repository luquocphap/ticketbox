import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { InventoryService } from './inventory.service';
import { IdempotencyInterceptor } from 'src/common/interceptors/idempotency.interceptor';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [RedisModule],
  controllers: [BookingController],
  providers: [BookingService, InventoryService, IdempotencyInterceptor],
})
export class BookingModule {}
