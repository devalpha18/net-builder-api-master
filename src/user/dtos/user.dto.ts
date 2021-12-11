import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

export class UserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty()
  walletAddress: string;

  @ApiProperty()
  invitation: string;

  @ApiProperty()
  star: number;
}

export class UserWithProfileDto extends UserDto {
  @ApiProperty()
  invitor: UserDto;
}
