import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { AuthModule } from './modules-api/auth/auth.module';
import { TokenModule } from './modules-system/token/token.module';
import { PrismaModule } from './modules-system/prisma/prisma.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ProtectGuard } from './common/guards/protect.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseSuccessInterceptor } from './common/interceptors/success-response.interceptor';
import { PermissionGuard } from './common/guards/permission.guard';
import { ConcertModule } from './modules-api/concert/concert.module';
import { VoucherModule } from './modules-api/voucher/voucher.module';
import { BookingModule } from './modules-api/booking/booking.module';

@Module({
  imports: [TokenModule, PrismaModule, ConcertModule, VoucherModule, BookingModule],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: ProtectGuard
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseSuccessInterceptor
    }
  ],
})
export class AppModule {}
