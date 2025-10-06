import { SetMetadata } from '@nestjs/common';

export const IS_BASIC_AUTH_KEY = 'basic-auth';
export const BasicAuth = () => SetMetadata(IS_BASIC_AUTH_KEY, true);