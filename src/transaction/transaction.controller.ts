import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TransactionDto } from './dtos/transaction.dto';
import { SuccessResponse } from '../common/models/common.model';
import { TransactionService } from './transaction.service';

@Controller('api/transaction')
@ApiTags('Transaction')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
  ) {
  }

  @Get('to')
  @ApiOkResponse({ type: TransactionDto, isArray: true })
  async getTransactionTo(@Request() req): Promise<TransactionDto[]> {
    const transactions = await this.transactionService.getTo(req.user.id);
    const transactionDto = transactions.map(transaction => transaction.toTransactionDto());
    return transactionDto;
  }

  @Post('add')
  @ApiOkResponse({ type: SuccessResponse })
  async addTransaction(@Body() body: TransactionDto): Promise<SuccessResponse> {
    const payload: TransactionDto = {
      from: body.from,
      to: body.to,
      amount: body.amount,
      hash: body.hash
    };
    await this.transactionService.save(payload);
    return new SuccessResponse();
  }
}
