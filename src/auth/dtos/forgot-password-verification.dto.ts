import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordVerificationDto {
  @ApiProperty()
  email: string;
}