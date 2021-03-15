import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import UsersRepository from '@components/users/users.repository';
import { UserEntity } from '@components/users/schemas/users.schema';
import { DecodedUser } from './interfaces/decoded-user.interface';
import { ValidateUserOutput } from './interfaces/validate-user-output.interface';
import { LoginPayload } from './interfaces/login-payload.interface';
import AuthRepository from './auth.repository';
import JwtTokensDto from './dto/jwt-tokens.dto';

@Injectable()
export default class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  public async verifyToken(token: string, secret: string): Promise<DecodedUser | null> {
    try {
      return (await this.jwtService.verifyAsync(token, { secret })) as DecodedUser || null;
    } catch (error) {
      return null;
    }
  }

  public async getUnexpiredRefreshTokens(email: string): Promise<string[]> {
    const refreshTokens: string[] = await this.authRepository.getRefreshTokens(email);

    return Promise.all(
      refreshTokens.filter(async (refreshToken: string): Promise<boolean> => {
        const verified: DecodedUser | null = await this.verifyToken(
          refreshToken,
          process.env.JWT_REFRESH_TOKEN_SECRET || '',
        );

        return !!verified;
      }),
    );
  }

  public async validateUser(
    email: string,
    password: string,
  ): Promise<null | ValidateUserOutput> {
    const user: UserEntity | null = await this.usersRepository.getByEmail(email);

    if (!user) {
      throw new NotFoundException('The item does not exist');
    }

    const passwordCompared: boolean = await bcrypt.compare(password, user.password);

    if (passwordCompared) {
      return {
        id: user._id,
        email: user.email,
      };
    }

    return null;
  }

  public async login(payload: LoginPayload): Promise<JwtTokensDto> {
    const [
      accessToken,
      refreshToken,
      unexpiredRefreshTokens,
    ]: [string, string, string[]] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: process.env.JWT_ACCESS_TOKEN_TTL,
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: process.env.JWT_REFRESH_TOKEN_TTL,
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      }),
      this.getUnexpiredRefreshTokens(payload.email),
    ]);

    await this.authRepository.setRefreshTokens(
      payload.email,
      [...unexpiredRefreshTokens, refreshToken],
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  public deleteTokenByEmail(email: string, refreshToken: string): Promise<number> {
    return this.authRepository.removeToken(email, refreshToken);
  }
}
