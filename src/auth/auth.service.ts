import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';

import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserVerification } from './entities/update-user-verification.entity';
import { verificationCodeExpiresIn } from '../common/constants/secret.constant';
import { SuccessResponse } from '../common/models/common.model';
import { ForgotPasswordVerification } from './entities/forgot-password-verification.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectRepository(UpdateUserVerification)
    private readonly updateUserVerificationRepository: Repository<UpdateUserVerification>,
    @InjectRepository(ForgotPasswordVerification)
    private readonly forgotPasswordVerificationRepository: Repository<ForgotPasswordVerification>
  ) {
  }

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.userService.findUserByEmail(email);
    if (user && (await compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  login(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };
    // returns access token
    return this.jwtService.sign(payload);
  }

  async saveUpdateUserVerification(userId: string): Promise<UpdateUserVerification> {
    const code = `${Math.floor(Math.random() * 1000000)}`.padStart(6, '0');
    await this.updateUserVerificationRepository.delete({ userId });
    const updateUserVerification = new UpdateUserVerification();
    updateUserVerification.code = code;
    updateUserVerification.userId = userId;
    updateUserVerification.exp = Math.floor((Date.now() + verificationCodeExpiresIn) / 1000);
    return this.updateUserVerificationRepository.save(updateUserVerification);
  }

  async findUpdateUserVerificationByUserIdAndCode(userId: string, code: string): Promise<UpdateUserVerification> {
    return this.updateUserVerificationRepository.findOne({ userId, code });
  }

  async deleteUpdateUserVerification(verification: UpdateUserVerification): Promise<SuccessResponse> {
    await this.updateUserVerificationRepository.remove(verification);
    return new SuccessResponse();
  }

  async saveForgotPasswordVerification(email: string): Promise<ForgotPasswordVerification> {
    const code = `${Math.floor(Math.random() * 1000000)}`.padStart(6, '0');
    await this.forgotPasswordVerificationRepository.delete({ email });
    const forgotPasswordVerification = new ForgotPasswordVerification();
    forgotPasswordVerification.code = code;
    forgotPasswordVerification.email = email;
    forgotPasswordVerification.exp = Math.floor((Date.now() + verificationCodeExpiresIn) / 1000);
    return this.forgotPasswordVerificationRepository.save(forgotPasswordVerification);
  }

  async findForgotPasswordVerificationByEmailAndCode(email: string, code: string): Promise<ForgotPasswordVerification> {
    return this.forgotPasswordVerificationRepository.findOne({ email, code });
  }

  async deleteForgotPasswordVerification(verification: ForgotPasswordVerification): Promise<SuccessResponse> {
    await this.forgotPasswordVerificationRepository.remove(verification);
    return new SuccessResponse();
  }
}


