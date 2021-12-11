import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponse {
  @ApiProperty()
  success: boolean;

  constructor(success = true) {
    this.success = success;
  }
}