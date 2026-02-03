/* eslint-disable @typescript-eslint/require-await */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';
import { LoginRequest } from './dtos/login-request.dto';
import { ReqUser } from 'src/common/decorator/auth.decorator';
import { PassportUser } from './dtos/passport-user.dto';
import { LoginResponse } from './dtos/login-response.dto';
import { WebResponse } from 'src/common/dtos/web-response.dto';
import express from 'express';
import { Public } from 'src/common/decorator/public.decorator';
import { RegisterRequest } from './dtos/register-request.dto';
import { TokenPayload } from './paseto/dtos/token-payload.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(201)
  async register(@Body() request: RegisterRequest): Promise<WebResponse<void>> {
    await this.authService.register(request);

    return {
      code: 201,
      status: true,
      message: 'USER_CREATED',
    };
  }

  @Public()
  @UseGuards(LocalGuard)
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() request: LoginRequest,
    @ReqUser() auth: PassportUser,
    @Res({ passthrough: true }) response: express.Response,
  ): Promise<WebResponse<LoginResponse>> {
    const result = await this.authService.login(auth);

    response.cookie('refreshToken', result.token?.refreshToken, {
      httpOnly: true, // Crucial: Prevents client-side JS access
      secure: process.env.NODE_ENV === 'production', // Use 'secure' in production (HTTPS)
      sameSite: 'strict', // Protects against CSRF (Cross-Site Request Forgery) attacks
      maxAge: 15 * 24 * 60 * 60 * 1000, //15 day
    });

    return {
      code: 200,
      status: true,
      data: result,
      message: 'USER_LOGGEDIN',
    };
  }

  @Get('me')
  @HttpCode(200)
  async me(@ReqUser() user: TokenPayload): Promise<WebResponse<TokenPayload>> {
    console.log(user);
    return {
      code: 200,
      status: true,
      data: user,
      message: 'USER_FETCHED',
    };
  }
}
