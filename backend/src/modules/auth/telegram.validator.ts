import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

export interface TelegramUserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  is_premium?: boolean;
}

const INIT_DATA_MAX_AGE_SECONDS = 24 * 60 * 60;

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

    const hashBuf = Buffer.from(hash, 'hex');
    const computedBuf = Buffer.from(computedHash, 'hex');
    if (hashBuf.length !== computedBuf.length || !timingSafeEqual(hashBuf, computedBuf)) {
      throw new UnauthorizedException('Invalid initData signature');
    }

    const authDateStr = urlParams.get('auth_date');
    const authDate = authDateStr ? parseInt(authDateStr, 10) : NaN;
    if (!Number.isFinite(authDate)) {
      throw new UnauthorizedException('Missing or invalid auth_date in initData');
    }
    const ageSeconds = Math.floor(Date.now() / 1000) - authDate;
    if (ageSeconds < 0 || ageSeconds > INIT_DATA_MAX_AGE_SECONDS) {
      throw new UnauthorizedException('initData is expired');
    }

    const userParam = urlParams.get('user');
    if (!userParam) {
      throw new UnauthorizedException('Missing user data in initData');
    }

    let userData: TelegramUserData;
    try {
      userData = JSON.parse(userParam) as TelegramUserData;
    } catch {
      throw new UnauthorizedException('Malformed user data in initData');
    }
    if (typeof userData?.id !== 'number' || typeof userData?.first_name !== 'string') {
      throw new UnauthorizedException('Invalid user data in initData');
    }
    return userData;
  }
}
