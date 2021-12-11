import { ApiProperty } from '@nestjs/swagger';

export class LevelupDto {
  @ApiProperty()
  transactionHash: string;
}