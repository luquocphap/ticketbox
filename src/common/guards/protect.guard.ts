
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TokenService } from 'src/modules-system/token/token.service';
import { TokenPayload } from 'src/modules-system/token/token.types';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class ProtectGuard implements CanActivate {
    constructor(private reflector: Reflector, private tokenService: TokenService, private prisma: PrismaService) {}
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    try {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])
        if (isPublic){
            return true;
        }

        const req = context.switchToHttp().getRequest();
        const { accessToken } = req.cookies;

        if (!accessToken) throw new UnauthorizedException("Not Found Token");

        const decode: TokenPayload = this.tokenService.verifyAccessToken(accessToken);

        const user = await this.prisma.users.findUnique({
            where: {
                id: String(decode.userId)
            }
        })

        req.user = user;

        if (!user) throw new UnauthorizedException("Fail to Authorize")
        return true;
    } catch (error: any){
        console.log({error})
        switch (error.constructor) {
            case TokenExpiredError:
                throw new ForbiddenException(error.message);
                break;
        
            default:
                throw new UnauthorizedException("Authentication Error")
                break;
        }
    }
  }
}
