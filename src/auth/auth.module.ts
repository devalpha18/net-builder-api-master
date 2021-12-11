import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtStrategy } from '../common/guards/jwt.strategy';
import { jwtConstant } from '../common/constants/secret.constant';

import { UserModule } from '../user/user.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UpdateUserVerification } from './entities/update-user-verification.entity';
import { ForgotPasswordVerification } from './entities/forgot-password-verification.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  providers: [
    AuthService,
    JwtStrategy
  ],
  controllers: [AuthController],
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstant.secret,
      signOptions: { expiresIn: jwtConstant.expiresIn },
    }),
    UserModule,
    MailModule,
    TypeOrmModule.forFeature([UpdateUserVerification, ForgotPasswordVerification])
  ]
})
export class AuthModule {}
