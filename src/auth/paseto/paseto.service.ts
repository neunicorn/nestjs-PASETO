/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenResponse } from './dtos/token-response.dto';
import { TokenPayload } from './dtos/token-payload.dto';
import { ConfigService } from '@nestjs/config';
import { V3 as paseto } from 'paseto';

@Injectable()
export class PasetoService {
  private readonly ACCESS_TOKEN_SECRET: string;
  private readonly REFRESH_TOKEN_SECRET: string;

  constructor(private configService: ConfigService) {
    const accessSecret = this.configService.get<string>('ACCESS_TOKEN_SECRET');
    const refreshSecret = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    );

    if (!accessSecret || !refreshSecret) {
      throw new Error('PASETO secrets are missing in the .env file!');
    }

    this.ACCESS_TOKEN_SECRET = accessSecret;
    this.REFRESH_TOKEN_SECRET = refreshSecret;
  }

  async generateToken(payload: TokenPayload): Promise<TokenResponse> {
    console.log(payload);
    const accessToken = await paseto.encrypt(
      payload as any,
      this.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '15m',
      },
    );
    const refreshToken = await paseto.encrypt(
      payload as any,
      this.REFRESH_TOKEN_SECRET,
      { expiresIn: '15d' },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyAccessToken(token: string) {
    try {
      // It automatically checks if the token is expired
      const payload = await paseto.decrypt(token, this.ACCESS_TOKEN_SECRET);
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid Access Token');
    }
  }
  async verifyRefreshToken(token: string) {
    try {
      // It automatically checks if the token is expired
      const payload = await paseto.decrypt(token, this.REFRESH_TOKEN_SECRET);
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid Access Token');
    }
  }
}
