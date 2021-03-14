import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import SignUpDto from '@components/auth/dto/sign-up.dto';
import authConstants from '@components/auth/auth.constants';
import { UserEntity } from './schemas/users.schema';
import UsersRepository from './users.repository';

@Injectable()
export default class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  public async create(user: SignUpDto): Promise<UserEntity> {
    const hashedPassword = await bcrypt.hash(user.password, authConstants.salts.password);

    return this.usersRepository.create({
      password: hashedPassword,
      email: user.email,
    });
  }
}
