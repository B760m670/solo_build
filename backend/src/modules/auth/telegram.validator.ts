import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

export interface TelegramUserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  is_premium?: boolean;
}

@Injectable()
export class TelegramValidator {
  constructor(private config: ConfigService) {}

  validate(initData: string): TelegramUserData {
    const botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new UnauthorizedException('Bot token not configured');
    }

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) {
      throw new UnauthorizedException('Missing hash in initData');
    }

    urlParams.delete('hash');
    const entries = Array.from(urlParams.entries());
    entries.sort(([a], [b]) => a.localeCompare(b));
    const dataCheckString = entries
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    const computedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (computedHash !== hash) {
      throw new UnauthorizedException('Invalid initData signature');
    }

    const userParam = urlParams.get('user');
    if (!userParam) {
      throw new UnauthorizedException('Missing user data in initData');
    }

    const userData: TelegramUserData = JSON.parse(userParam);
    return userData;
  }
}
