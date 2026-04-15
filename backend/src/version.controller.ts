import { Controller, Get } from '@nestjs/common';

@Controller('version')
export class VersionController {
  @Get()
  getVersion() {
    const envCommit =
      process.env.RENDER_GIT_COMMIT ||
      process.env.VERCEL_GIT_COMMIT_SHA ||
      process.env.GIT_COMMIT ||
      process.env.GIT_SHA;

    return {
      service: 'unisouq-backend',
      commit: envCommit || 'unknown',
      nodeEnv: process.env.NODE_ENV || 'unknown',
      now: new Date().toISOString(),
    };
  }
}

