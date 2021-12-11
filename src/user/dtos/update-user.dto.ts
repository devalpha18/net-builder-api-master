import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  walletAddress: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  code: string;
}