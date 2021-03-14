import * as Mongoose from 'mongoose';
import { Module, Logger } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Redis } from 'ioredis';
import AuthModule from '@components/auth/auth.module';
import CurrenciesModule from '@components/currencies/currencies.module';
import UsersModule from '@components/users/users.module';
import AppController from './app.controller';
import AppService from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL || '', {
      connectionFactory: (connection: Mongoose.Connection) => {
        connection.on('error', (error: any) => {
          Logger.error(error);
        });
        connection.on('reconnectFailed', () => {
          Logger.error('Reconnect to Mongodb has been failed');
        });
        connection.on('attemptReconnect', () => {
          Logger.log('attempt to reconnect Mongodb');
        });
        connection.on('reconnect', () => {
          Logger.log('reconnect to Mongodb');
        });
        connection.on('open', () => {
          Logger.log('Mongodb is connected successfully');
        });

        return connection;
      },
      // automatically try to reconnect when it loses connection
      autoReconnect: true,
      useCreateIndex: true,
      // reconnect every reconnectInterval milliseconds
      // for reconnectTries times
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 1000,
      // flag to allow users to fall back to the old
      // parser if they find a bug in the new parse
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    RedisModule.register({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      onClientReady: async (client: Redis): Promise<void> => {
        client.on('error', Logger.error);
        client.on('ready', () => {
          Logger.log(`redis is running on ${process.env.REDIS_PORT} port`);
        });
        client.on('restart', () => {
          Logger.log('attempt to restart the redis server');
        });
      },
      reconnectOnError: (error: Error) => {
        Logger.error(error);

        return true;
      },
    }),
    AuthModule,
    UsersModule,
    CurrenciesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export default class AppModule {}
