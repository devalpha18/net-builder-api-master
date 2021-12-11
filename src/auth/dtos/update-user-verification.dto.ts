import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserVerificationDto {
  @ApiProperty()
  email: string;
}