import { HttpService, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { UserWithProfileDto } from '../user/dtos/user.dto';
import { tronTransactionConfirmURL } from '../common/constants/secret.constant';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionDto } from '../transaction/dtos/transaction.dto';

@Injectable()
export class LevelService {
  constructor(
    private readonly userService: UserService,
    private readonly transactionService: TransactionService,
    private readonly http: HttpService,
  ) {
  }

  async findMaster(id: number, star: number): Promise<UserWithProfileDto> {
    const me = (await this.userService.findUserById(id)).toUserWithProfileDto();
    if(me.invitor == null)
      return me;
    let userId = me.invitor.id;
    let user = null;
    for (let i = 0; i < star + 1; i++) {
      user = (await this.userService.findUserById(userId)).toUserWithProfileDto();
      if(user.invitor)
        userId = user.invitor.id;
      else
        break;
    }
    while(user.star <= star && user.invitor && user.star <= 0) {
      userId = user.invitor.id;
      user = (await this.userService.findUserById(userId)).toUserWithProfileDto();
    }
    return user;
  }

  findInvitor(userId: number): Promise<User> {
    return new Promise(async (resolve, reject) => {
      const user = await this.userService.findUserById(userId);
      resolve(user.invitor ? user.invitor.user : null);
    });
  }

  async levelUp(user: User): Promise<User> {
    user.star += 1;
    user = await this.userService.saveUser(user);
    return user;
  }

  async confirmTransaction(transactionHash: string, master: UserWithProfileDto, user: User): Promise<string> {
    try {
      const transactionResult = await this.http.get(tronTransactionConfirmURL + transactionHash).toPromise();
      const result = transactionResult.data.contractRet;
      if(result == "SUCCESS") {
        const to_address = transactionResult.data.tokenTransferInfo.to_address;
        const symbol = transactionResult.data.tokenTransferInfo.symbol;
        const amount = Number(transactionResult.data.tokenTransferInfo.amount_str) / 1000000;
        const expectedAmount = '10.' + `${user.id}`.padStart(6, '0');
        if(master.walletAddress == to_address && symbol == 'USDT' && amount == parseFloat(expectedAmount))
        {
          const payload: TransactionDto = {
            from: user.id,
            to: master.id,
            amount: amount,
            hash: transactionHash
          };
          await this.transactionService.save(payload);
          return result;
        }
        else
          return 'Incorrect Transaction. Please check wallet address and TRON amount';
      } else {
        return 'Transaction is failed: ' + result + '. Please make another TRON transaction';
      }
    } catch (e) {
      return 'Incorrect Transaction. Please check the token as USDT';
    }
  }
}
