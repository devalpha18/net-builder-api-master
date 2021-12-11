import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class FriendDto {
  @ApiProperty()
  level: number;

  @ApiProperty()
  user: UserDto;
}
