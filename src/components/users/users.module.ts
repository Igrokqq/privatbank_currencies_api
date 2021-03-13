import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/users.schema';
import constants from './users.constants';
import UsersService from './users.service';
import UsersRepository from './users.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: constants.models.users,
      schema: UserSchema,
    }]),
  ],
  controllers: [],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export default class UsersModule {}
