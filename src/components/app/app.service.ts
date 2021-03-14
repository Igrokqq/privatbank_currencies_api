import { Injectable } from '@nestjs/common';

@Injectable()
export default class AppService {
  public getPingMessage(): string {
    return 'Hello world!';
  }

  public getBaseUrl(): string {
    return process.env.NODE_ENV === 'development'
      ? `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}`
      : `${process.env.PROTOCOL}://${process.env.HOST}`;
  }

  public getPort(): number {
    return Number(process.env.PORT) || 3000;
  }
}
