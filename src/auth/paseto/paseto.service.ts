/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/await-thenable */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenResponse } from './dtos/token-response.dto';
import { TokenPayload } from './dtos/token-payload.dto';
import { ConfigService } from '@nestjs/config';
import { V4 } from 'paseto';

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
    const accessToken = await V4.sign(Buffer.from(this.ACCESS_TOKEN_SECRET), payload: {
      sub: payload.userId
    });
    const refreshToken = await encrypt(this.REFRESH_TOKEN_SECRET, {
      sub: payload.userId,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyAccessToken(token: string) {
    try {
      // It automatically checks if the token is expired
      const { payload } = await decrypt(token, this.ACCESS_TOKEN_SECRET);
      return {
        userId: payload.sub,
      };
    } catch {
      throw new UnauthorizedException('Invalid Access Token');
    }
  }
  async verifyRefreshToken(token: string) {
    try {
      // It automatically checks if the token is expired
      const { payload } = await decrypt(token, this.REFRESH_TOKEN_SECRET);
      return {
        userId: payload.sub,
      };
    } catch {
      throw new UnauthorizedException('Invalid Access Token');
    }
  }
}
