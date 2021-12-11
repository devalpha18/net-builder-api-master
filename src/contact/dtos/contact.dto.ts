import { ApiProperty } from '@nestjs/swagger';

export class ContactDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;
}