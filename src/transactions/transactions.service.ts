import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/transaction.dto';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly txModel: Model<TransactionDocument>,
    private readonly accountsService: AccountsService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const acct = await this.accountsService.findById(dto.accountId, session);
      if (!acct) throw new NotFoundException('Account does not exist');
      if (!acct.isActive) throw new BadRequestException('Account is frozen');

      const balance = await this.accountsService.getBalance(
        dto.accountId,
        session,
      );
      if (dto.type === 'withdraw' && balance < dto.amount) {
        throw new BadRequestException('Insufficient funds');
      }

      const tx = await this.txModel.create([dto], { session });

      await session.commitTransaction();
      return tx[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
