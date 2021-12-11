import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class TransactionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  createdAt?: string;

  @ApiProperty()
  from: number;

  @ApiProperty()
  to: number;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  hash: string;
}