import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ADMIN_KEY } from '../decorators/admin.decorator';

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

    if (!isAdmin) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const adminIds = (this.config.get<string>('ADMIN_TELEGRAM_IDS') || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (!adminIds.includes(String(user.telegramId))) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
