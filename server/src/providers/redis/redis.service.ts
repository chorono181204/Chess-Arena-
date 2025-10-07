import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';
import { SavePayload } from './types/redis.types';
import { RedisConfig } from '@config/types/config.type';

@Injectable()
export class RedisService {
  redisClient: RedisClient;

  constructor(private configService: ConfigService) {
    const redisConfig: RedisConfig = this.configService.get('redis');

    this.redisClient = new Redis({
      port: redisConfig.port,
      host: redisConfig.host,
      username: redisConfig.username,
      password: redisConfig.password,
    });
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async save(payload: SavePayload): Promise<boolean> {
    const { key, value, expireInSeconds } = payload;

    const result = await this.redisClient.set(
      key,
      value,
      'EX',
      expireInSeconds,
    );

    return result === 'OK';
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.redisClient.del(key);

    return result === 1;
  }

  async deleteMany(keys: string[]): Promise<boolean> {
    const result = await this.redisClient.del(keys);

    return result === keys.length;
  }

  async deleteAll(): Promise<boolean> {
    const result = await this.redisClient.flushall();

    return result === 'OK';
  }
}
