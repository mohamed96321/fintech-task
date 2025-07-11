import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { TransactionsService } from './transactions.service';
import { AccountsService } from '../accounts/accounts.service';
import { Model, Connection, ClientSession } from 'mongoose';
import { Transaction } from './schemas/transaction.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let txModel: Partial<Model<Transaction>>;
  let acctService: Partial<AccountsService>;
  let session: Partial<ClientSession>;
  let connection: Partial<Connection>;

  beforeEach(async () => {
    session = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    connection = { startSession: jest.fn().mockResolvedValue(session) };

    txModel = { create: jest.fn() };
    acctService = {
      findById: jest.fn(),
      getBalance: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: AccountsService, useValue: acctService },
        { provide: getModelToken(Transaction.name), useValue: txModel },
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('throws NotFoundException when account does not exist', async () => {
    (acctService.findById as jest.Mock).mockResolvedValue(null);
    await expect(
      service.create({ accountId: '1', type: 'deposit', amount: 50 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when account is frozen', async () => {
    (acctService.findById as jest.Mock).mockResolvedValue({
      isActive: false,
    } as any);
    await expect(
      service.create({ accountId: '1', type: 'deposit', amount: 50 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException on insufficient funds', async () => {
    (acctService.findById as jest.Mock).mockResolvedValue({
      isActive: true,
    } as any);
    (acctService.getBalance as jest.Mock).mockResolvedValue(20);
    await expect(
      service.create({ accountId: '1', type: 'withdraw', amount: 50 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('commits transaction and returns created tx on success', async () => {
    const dto = { accountId: '1', type: 'deposit', amount: 100 };
    (acctService.findById as jest.Mock).mockResolvedValue({
      isActive: true,
    } as any);
    (acctService.getBalance as jest.Mock).mockResolvedValue(0);
    const fakeTx = { ...dto, _id: 'tx1' };
    (txModel.create as jest.Mock).mockResolvedValue([fakeTx]);

    const result = await service.create(dto as any);
    expect(connection.startSession).toHaveBeenCalled();
    expect(session.startTransaction).toHaveBeenCalled();
    expect(txModel.create).toHaveBeenCalledWith([dto], { session });
    expect(session.commitTransaction).toHaveBeenCalled();
    expect(result).toEqual(fakeTx);
  });
});
