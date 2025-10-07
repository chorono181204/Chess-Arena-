import { ConfigType } from '@nestjs/config';
import appConfig from '@config/app.config';
import jwtConfig from '@config/jwt.config';
import redisConfig from '@config/redis.config';
import swaggerConfig from '@config/swagger.config';

export type AppConfig = Readonly<ConfigType<typeof appConfig>>;
export type JwtConfig = Readonly<ConfigType<typeof jwtConfig>>;
export type RedisConfig = Readonly<ConfigType<typeof redisConfig>>;
export type SwaggerConfig = Readonly<ConfigType<typeof swaggerConfig>>;
