import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, ClientSession } from 'mongoose';
import { Account, AccountDocument } from './schemas/account.schema';
import { TransactionDocument } from '../transactions/schemas/transaction.schema';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private acctModel: Model<AccountDocument>,
    @InjectModel('Transaction') private txModel: Model<TransactionDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(dto: any): Promise<Account> {
    return this.acctModel.create(dto);
  }

  async findById(
    id: string,
    session?: ClientSession,
  ): Promise<AccountDocument | null> {
    return this.acctModel
      .findById(id)
      .session(session ?? null)
      .exec();
  }

  async setAccountStatus(id: string, status: boolean): Promise<Account> {
    const acct = await this.acctModel
      .findByIdAndUpdate(id, { isActive: status }, { new: true })
      .exec();
    if (!acct) throw new NotFoundException('Account not found');
    return acct;
  }

  async getBalance(
    accountId: string,
    session?: ClientSession,
  ): Promise<number> {
    const acct = await this.findById(accountId, session);
    if (!acct) throw new NotFoundException('Account not found');

    type BalanceAggResult = { balance: number };
    const aggResult = await this.txModel
      .aggregate([
        { $match: { accountId } },
        {
          $group: {
            _id: null,
            balance: {
              $sum: {
                $cond: [
                  { $eq: ['$type', 'deposit'] },
                  '$amount',
                  { $multiply: ['$amount', -1] },
                ],
              },
            },
          },
        },
      ])
      .session(session ?? null);

    const agg = aggResult[0] as BalanceAggResult | undefined;
    return typeof agg?.balance === 'number' ? agg.balance : 0;
  }
}
