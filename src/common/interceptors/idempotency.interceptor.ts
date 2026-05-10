import {
    Injectable, NestInterceptor, ExecutionContext,
    CallHandler, Logger
} from '@nestjs/common'
import { InjectRedis } from '@nestjs-modules/ioredis'
import { Observable, tap, of } from 'rxjs'
import Redis from 'ioredis'

const TTL = 60 * 60 * 24

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
    private readonly logger = new Logger(IdempotencyInterceptor.name)

    constructor(@InjectRedis() private readonly redis: Redis) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest()
        const key = request.body?.idempotencyKey

        if (!key) return next.handle()

        const redisKey = `idempotency:${key}`
        const cached = await this.redis.get(redisKey)

        if (cached) {
            this.logger.log(`Idempotency hit: ${key}`)
            return of(JSON.parse(cached))
        }

        return next.handle().pipe(
            tap(async (body) => {
                await this.redis.set(redisKey, JSON.stringify(body), 'EX', TTL)
                this.logger.log(`Idempotency stored: ${key}`)
            })
        )
    }
}