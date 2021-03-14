import * as Redis from 'ioredis';
import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';

@Injectable()
export default class AuthRepository {
  private readonly redisClient: Redis.Redis;

  constructor(private readonly redisService: RedisService) {
    this.redisClient = redisService.getClient();
  }

  public async setRefreshTokens(email: string, refreshTokens: string[]): Promise<void> {
    await this.redisClient.set(
      email,
      JSON.stringify(refreshTokens),
      'EX',
      process.env.JWT_REFRESH_TOKEN_DB_TTL,
    );
  }

  public async getRefreshTokens(email: string): Promise<string[]> {
    const serializedTokens: string | null = await this.redisClient.get(email);

    return JSON.parse(serializedTokens || '[]');
  }

  public async removeToken(key: string, refreshToken: string): Promise<number> {
    const refreshTokens: string[] = JSON.parse((await this.redisClient.get(key)) || '[]');
    const refreshTokensWithoutRemoved: string[] = refreshTokens.filter((token: string): boolean => token !== refreshToken);

    await this.redisClient.set(key, JSON.stringify(refreshTokensWithoutRemoved));

    return refreshTokens.length - refreshTokensWithoutRemoved.length;
  }
}
