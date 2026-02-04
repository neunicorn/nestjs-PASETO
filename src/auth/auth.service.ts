import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PassportUser } from './dtos/passport-user.dto';
import { LoginResponse } from './dtos/login-response.dto';
import { PasetoService } from './paseto/paseto.service';
import { TokenPayload } from './paseto/dtos/token-payload.dto';
import { RegisterRequest } from './dtos/register-request.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private readonly authRepo: Repository<Auth>,
    private readonly pasetoService: PasetoService,
  ) {}

  async register(request: RegisterRequest): Promise<void> {
    request.password = await this.hashPassword(request.password);
    const user = this.authRepo.create({ ...request });
    await this.authRepo.save(user);
  }

  async login(auth: PassportUser): Promise<LoginResponse> {
    const user = await this.authRepo.findOne({ where: { id: auth.id } });
    if (!user) {
      throw new UnauthorizedException('wrong email password');
    }
    const payload: TokenPayload = {
      sub: auth.id,
    };
    const token = await this.pasetoService.generateToken(payload);

    const hashedToken = await this.hashPassword(token.refreshToken);

    user.jwtRefreshToken = hashedToken;

    await this.authRepo.save(user);

    return {
      id: user.id,
      token: {
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    const auth = await this.authRepo.findOne({ where: { id: userId } });

    if (!auth) {
      throw new UnauthorizedException('user not found');
    }

    auth.jwtRefreshToken = '';

    await this.authRepo.save(auth);
  }

  async findUserByEmail(email: string) {
    const auth = await this.authRepo.findOne({ where: { email: email } });

    if (!auth) {
      return null;
    }

    return auth;
  }

  async verifyUser(email: string, password: string) {
    const auth = await this.findUserByEmail(email);
    if (!auth) {
      throw new UnauthorizedException('Wrong email or password');
    }

    const authenticated = await bcrypt.compare(password, auth.password);
    if (!authenticated) {
      throw new UnauthorizedException('Wrong email or password');
    }

    return auth;
  }

  private async hashPassword(p: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(p, salt);

    return hash;
  }
}
