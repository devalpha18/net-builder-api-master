import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { TransactionDto } from './dtos/transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {
  }

  async getTo(userId: number): Promise<Transaction[]> {
    return this.transactionRepository.find({ to: userId })
  }

  async save(payload: TransactionDto): Promise<Transaction> {
    const transaction = new Transaction();
    transaction.from = payload.from;
    transaction.to = payload.to;
    transaction.amount = payload.amount;
    transaction.hash = payload.hash;
    return this.transactionRepository.save(transaction);
  }

  async findTransactionByHash(hash: string) : Promise<Transaction> {
    return this.transactionRepository.findOne({ hash })
  }
}
