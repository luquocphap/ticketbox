
import { Injectable, CanActivate, ExecutionContext, ConsoleLogger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/modules-system/prisma/prisma.service';
import { TokenService } from 'src/modules-system/token/token.service';
import { PERMISSION_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private prisma: PrismaService, private reflector: Reflector) {}
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const permission = this.reflector.get<string[]>(PERMISSION_KEY, context.getHandler());
    if (!permission) {
        return true;
    }

    console.log({permission});
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log(user);
    const query = request.query;

    const action = permission[0];
    const resource = permission[1];


    const isPermitted = await this.prisma.role_permissions.findFirst({
      where: {
        loai_nguoi_dung: user.loai_nguoi_dung,
        permissions: {
          action: action,
          resource: resource
        }
      }
    })

    if (resource === "USER PROFILE" && query.taiKhoan && user.tai_khoan == query.taiKhoan){
      return true
    }

    if (!isPermitted) throw new BadRequestException('Bạn không có quyền thực hiện hành động này')

    return true;
  }
}
