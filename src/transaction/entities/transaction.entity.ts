import { Column, Entity } from 'typeorm';
import { SoftDelete } from '../../common/core/soft-delete';
import { ColumnNumericTransformer } from '../../common/utils/typeorm.util';
import { TransactionDto } from '../dtos/transaction.dto';

@Entity('transaction')
export class Transaction extends SoftDelete {
  @Column()
  from: number;

  @Column()
  to: number;

  @Column()
  hash: string;

  @Column('numeric', {
      precision: 17,
      scale: 2,
      transformer: new ColumnNumericTransformer(),
    },
  )
  amount: number;

  toTransactionDto(): TransactionDto {
    return {
      createdAt: this.createdAt,
      from: this.from,
      to: this.to,
      amount: this.amount,
      hash: this.hash
    };
  }
}
