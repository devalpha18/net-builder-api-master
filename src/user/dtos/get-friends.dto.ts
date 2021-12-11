import { ApiProperty } from '@nestjs/swagger';

export class GetFriendsDto {
  @ApiProperty()
  keyword: string;
}
