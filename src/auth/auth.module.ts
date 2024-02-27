import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { STRATEGIES } from './strategies';
import { GUARDS } from '@auth/guards';
import { jwtOptions } from './config/jwt-module-options';
import { UsersService } from '@users/users.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersService, ...STRATEGIES, ...GUARDS],
  imports: [PassportModule, JwtModule.registerAsync(jwtOptions())],
})
export class AuthModule {}
