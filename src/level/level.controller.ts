import { BadRequestException, Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LevelService } from './level.service';
import { UserService } from '../user/user.service';
import { SuccessResponse } from '../common/models/common.model';
import { LevelupDto } from './dtos/levelup.dto';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionDto } from '../transaction/dtos/transaction.dto';

@Controller('api/level')
@ApiTags('Level')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LevelController {
  constructor(
    private readonly levelService: LevelService,
    private readonly userService: UserService,
    private readonly transactionService: TransactionService
  ) {
  }

  @Post('up')
  async upgradeLevel(@Request() req, @Body() body: LevelupDto): Promise<SuccessResponse> {
    const transaction = await this.transactionService.findTransactionByHash(body.transactionHash);
    if(transaction) {
      throw new BadRequestException('This transaction hash is used by others. Please try again with another transaction');
    }
    let user = await this.userService.findUserById(req.user.id);
    if (!user) {
      throw new BadRequestException('Incorrect user. Please try again with correct user');
    }
    const master = await this.levelService.findMaster(user.id, user.star);
    if (!master) {
      throw new BadRequestException('Can not find the superior. Please try again');
    }
    const transactionResult = await this.levelService.confirmTransaction(body.transactionHash, master, user);
    if (!transactionResult) {
      throw new BadRequestException('Can not check TRON transaction result. Please try again with correct result hash');
    } else if (transactionResult == 'SUCCESS') {
      user = await this.levelService.levelUp(user);
      return new SuccessResponse();
    } else {
      throw new BadRequestException(transactionResult);
    }
  }
}
