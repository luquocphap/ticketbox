import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { AuthModule } from './modules-api/auth/auth.module';
import { InjectRedis, RedisModule } from '@nestjs-modules/ioredis';
import { REDIS_URL } from './common/constants/app.constant';
import Redis from 'ioredis';

@Module({
  imports: [TokenModule, PrismaModule, AuthModule, ConcertModule, VoucherModule, BookingModule,
    RedisModule.forRootAsync({
      useFactory: () => ({
        type: 'single',
        url: REDIS_URL,
      })
    })
  ],
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
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger('RedisCheck')
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async onModuleInit() {
    const ping = await this.redis.ping()
    this.logger.log(`Redis ping: ${ping}`)
  }
}