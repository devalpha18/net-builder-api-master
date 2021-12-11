import { HttpModule, Module } from '@nestjs/common';

import { LevelController } from './level.controller';
import { LevelService } from './level.service';

import { UserModule } from '../user/user.module';
import { TransactionModule } from '../transaction/transaction.module';
import { TransactionService } from '../transaction/transaction.service';

@Module({
  controllers: [LevelController],
  imports: [UserModule, HttpModule, TransactionModule],
  providers: [LevelService]
})
export class LevelModule {}
