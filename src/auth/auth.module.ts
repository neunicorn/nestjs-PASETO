import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';
import { LocalStrategy } from './strategies/local.strategy';
import { PasetoGuard } from './guards/paseto.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Auth])],
  controllers: [AuthController],
  providers: [AuthService, LocalGuard, LocalStrategy, PasetoGuard],
  exports: [AuthModule],
})
export class AuthModule {}
