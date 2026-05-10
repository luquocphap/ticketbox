import {
    Injectable, NestInterceptor, ExecutionContext,
    CallHandler, Logger
} from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { InjectRedis } from '@nestjs-modules/ioredis'
import Redis from 'ioredis'

const IDEMPOTENCY_TTL = 60 * 60 * 24 // 24h

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
    private readonly logger = new Logger(IdempotencyInterceptor.name)

    constructor(@InjectRedis() private readonly redis: Redis) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest()
        const idempotencyKey = request.headers['idempotency-key']

        if (!idempotencyKey) return next.handle()

        const redisKey = `idempotency:${idempotencyKey}`
        const cached = await this.redis.get(redisKey)

        if (cached) {
            this.logger.log(`Idempotency hit: ${idempotencyKey}`)
            const response = context.switchToHttp().getResponse()
            response.status(200).json(JSON.parse(cached))
            return new Observable(subscriber => subscriber.complete())
        }

        return next.handle().pipe(
            tap(async (responseBody) => {
                await this.redis.set(redisKey, JSON.stringify(responseBody), 'EX', IDEMPOTENCY_TTL)
            })
        )
    }
}