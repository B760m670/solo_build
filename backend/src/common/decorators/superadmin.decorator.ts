import { SetMetadata } from '@nestjs/common';

export const SUPERADMIN_KEY = 'superadmin';
export const SuperAdmin = () => SetMetadata(SUPERADMIN_KEY, true);

