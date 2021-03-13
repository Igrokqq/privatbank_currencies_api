import * as Redis from 'ioredis';
import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';

@Injectable()
export default class AuthRepository {
  private readonly redisClient: Redis.Redis;

  constructor(private readonly redisService: RedisService) {
    this.redisClient = redisService.getClient();
  }

  public async addRefreshToken(email: string, refreshToken: string): Promise<void> {
    await this.redisClient.set(
      email,
      refreshToken,
      'EX',
      process.env.JWT_REFRESH_TOKEN_DB_TTL,
    );
  }

  public getToken(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  public removeToken(key: string): Promise<number> {
    return this.redisClient.del(key);
  }
}
