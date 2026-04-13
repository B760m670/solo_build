import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ADMIN_KEY } from '../decorators/admin.decorator';
import { SUPERADMIN_KEY } from '../decorators/superadmin.decorator';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isAdmin = this.reflector.getAllAndOverride<boolean>(ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isSuperAdmin = this.reflector.getAllAndOverride<boolean>(SUPERADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isAdmin && !isSuperAdmin) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const adminIds = (this.config.get<string>('ADMIN_TELEGRAM_IDS') || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    const isEnvAdmin = adminIds.includes(String(user.telegramId));

    if (isSuperAdmin) {
      if (!isEnvAdmin) {
        throw new ForbiddenException('Super admin access required');
      }
      return true;
    }

    const role = String(user?.role || '').toUpperCase();
    const isRoleAdmin = role === 'ADMIN' || role === 'MODERATOR';

    if (!isEnvAdmin && !isRoleAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
