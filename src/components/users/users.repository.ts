import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import SignUpDto from '@components/auth/dto/sign-up.dto';
import { UserEntity } from './schemas/users.schema';
import usersConstants from './users.constants';

@Injectable()
export default class UsersRepository {
  constructor(
    @InjectModel(usersConstants.models.users) private usersModel: Model<UserEntity>,
  ) {}

  public create(user: SignUpDto): Promise<UserEntity> {
    return this.usersModel.create(user);
  }

  public getByEmail(email: string): Promise<UserEntity | null> {
    return this.usersModel.findOne({
      email,
    }).exec();
  }
}
