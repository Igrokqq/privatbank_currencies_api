import {
  Body,
  Controller,
  HttpCode,
  Post,
  Delete,
  Param,
  UnauthorizedException,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import UsersService from '@components/users/users.service';
import JwtAccessGuard from '@guards/jwt-access.guard';
import { UserEntity } from '@components/users/schemas/users.schema';
import RequestUser from '@decorators/request-user.decorator';
import { DecodedUser } from './interfaces/decoded-user.interface';
import LocalAuthGuard from './guards/local-auth.guard';
import AuthService from './auth.service';
import RefreshTokenDto from './dto/refresh-token.dto';
import SignInDto from './dto/sign-in.dto';
import SignUpDto from './dto/sign-up.dto';
import JwtTokensDto from './dto/jwt-tokens.dto';

@ApiTags('Auth')
@Controller()
export default class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  @ApiBody({ type: SignInDto })
  @ApiOkResponse({
    type: JwtTokensDto,
    description: 'Returns jwt tokens',
  })
  @ApiBadRequestResponse({
    schema: {
      type: 'object',
      example: {
        message: [
          {
            target: {
              email: 'string',
              password: 'string',
            },
            value: 'string',
            property: 'string',
            children: [],
            constraints: {},
          },
        ],
        error: 'Bad Request',
      },
    },
    description: '400. ValidationException',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
        error: 'string',
      },
    },
    description: '500. InternalServerError',
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  public async signIn(@RequestUser() user: UserEntity): Promise<JwtTokensDto> {
    return this.authService.login({
      id: user.id,
      email: user.email,
    });
  }

  @ApiBody({ type: SignUpDto })
  @ApiOkResponse({
    type: UserEntity,
    description: '201, Success',
  })
  @ApiBadRequestResponse({
    schema: {
      type: 'object',
      example: {
        message: [
          {
            target: {
              email: 'string',
              password: 'string',
            },
            value: 'string',
            property: 'string',
            children: [],
            constraints: {},
          },
        ],
        error: 'Bad Request',
      },
    },
    description: '400. ValidationException',
  })
  @ApiConflictResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
        error: 'string',
      },
    },
    description: '409. ConflictResponse',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
        error: 'string',
      },
    },
    description: '500. InternalServerError',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  public async signUp(@Body() user: SignUpDto): Promise<UserEntity> {
    return this.usersService.create(user);
  }

  @ApiOkResponse({
    type: JwtTokensDto,
    description: '200, returns new jwt tokens',
  })
  @ApiUnauthorizedResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
      },
    },
    description: '401. Token has been expired',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
        error: 'string',
      },
    },
    description: '500. InternalServerError',
  })
  @ApiBearerAuth()
  @Post('refresh-token')
  public async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<JwtTokensDto | never> {
    const decodedUser = this.jwtService.decode(
      refreshTokenDto.refreshToken,
    ) as DecodedUser;

    if (!decodedUser) {
      throw new ForbiddenException('Incorrect token');
    }

    const oldRefreshTokens: string[] = await this.authService.getUnexpiredRefreshTokens(decodedUser.email);

    // if the old refresh token is not equal to request refresh token then this user is unauthorized
    if (!oldRefreshTokens.length || !oldRefreshTokens.includes(refreshTokenDto.refreshToken)) {
      throw new UnauthorizedException(
        'Authentication credentials were missing or incorrect',
      );
    }

    return this.authService.login({
      id: decodedUser.id,
      email: decodedUser.email,
    });
  }

  @ApiNoContentResponse({
    type: 'object',
    description: 'no content',
  })
  @ApiUnauthorizedResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
      },
    },
    description: 'Token has been expired',
  })
  @ApiInternalServerErrorResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
        error: 'string',
      },
    },
    description: '500. InternalServerError',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @Delete('logout/:token')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Param('token') token: string): Promise<{} | never> {
    const decodedUser: DecodedUser | null = await this.authService.verifyToken(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET || '',
    );

    if (!decodedUser) {
      throw new ForbiddenException('Incorrect token');
    }

    const deletedUsersCount: number = await this.authService.deleteTokenByEmail(
      decodedUser.email,
      token,
    );

    if (deletedUsersCount === 0) {
      throw new NotFoundException('The user does not exist');
    }

    return {};
  }
}
