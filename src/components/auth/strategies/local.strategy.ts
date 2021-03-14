import { Strategy } from 'passport-local';
import { validate, ValidationError } from 'class-validator';
import { Request as ExpressRequest } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import SignInDto from '../dto/sign-in.dto';
import { ValidateUserOutput } from '../interfaces/validate-user-output.interface';
import AuthService from '../auth.service';

@Injectable()
export default class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(req: ExpressRequest, email: string, password: string): Promise<ValidateUserOutput | never> {
    const errors: ValidationError[] = await validate(new SignInDto(email, password));

    if (errors.length) {
      throw new BadRequestException(errors);
    }

    const user: ValidateUserOutput | null = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
