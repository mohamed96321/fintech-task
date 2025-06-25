import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AccountsService } from './accounts.service';
import { Account, AccountDocument } from './schemas/account.schema';
import { NotFoundException } from '@nestjs/common';
import { Model, Aggregate } from 'mongoose';

type MockModel<T> = Partial<Record<keyof Model<T>, jest.Mock>>;

describe('AccountsService', () => {
  let service: AccountsService;
  let acctModel: MockModel<AccountDocument>;
  let txModel: MockModel<any>;

  beforeEach(async () => {
    acctModel = {
      findById: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
    txModel = {
      aggregate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: getModelToken(Account.name), useValue: acctModel },
        { provide: getModelToken('Transaction'), useValue: txModel },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  it('create should call model.create', async () => {
    const dto = {
      fullName: 'A',
      email: 'a@b.com',
      phone: '1',
      nationality: 'X',
      religion: 'Y',
      type: 'savings',
    };
    (acctModel.create as jest.Mock).mockResolvedValue(dto as Account);

    const result = await service.create(dto as any);

    expect(result).toEqual(dto);
    expect(acctModel.create).toHaveBeenCalledWith(dto);
  });

  it('findById returns account', async () => {
    const mockAccount = { _id: '1' } as AccountDocument;
    const exec = jest.fn().mockResolvedValue(mockAccount);
    (acctModel.findById as jest.Mock).mockReturnValue({
      session: () => ({ exec }),
    });

    const result = await service.findById('1');

    expect(result).toEqual(mockAccount);
    expect(acctModel.findById).toHaveBeenCalledWith('1');
  });

  it('setAccountStatus throws if not found', async () => {
    (acctModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      exec: () => Promise.resolve(null),
    });

    await expect(service.setAccountStatus('1', false)).rejects.toThrow(
      NotFoundException,
    );
    expect(acctModel.findByIdAndUpdate).toHaveBeenCalledWith(
      '1',
      { isActive: false },
      { new: true },
    );
  });

  it('getBalance throws if account not found', async () => {
    const exec = jest.fn().mockResolvedValue(null);
    (acctModel.findById as jest.Mock).mockReturnValue({
      session: () => ({ exec }),
    });

    await expect(service.getBalance('1')).rejects.toThrow(NotFoundException);
  });

  it('getBalance returns 0 for no transactions', async () => {
    const execAcct = jest
      .fn()
      .mockResolvedValue({ _id: '1' } as AccountDocument);
    (acctModel.findById as jest.Mock).mockReturnValue({
      session: () => ({ exec: execAcct }),
    });

    const aggregateMock = {
      session: () => Promise.resolve([]),
    } as unknown as Aggregate<any[]>;
    (txModel.aggregate as jest.Mock).mockReturnValue(aggregateMock);

    const balance = await service.getBalance('1');
    expect(balance).toBe(0);
  });

  it('getBalance aggregates correctly', async () => {
    const execAcct = jest
      .fn()
      .mockResolvedValue({ _id: '1' } as AccountDocument);
    (acctModel.findById as jest.Mock).mockReturnValue({
      session: () => ({ exec: execAcct }),
    });

    const aggregateMock = {
      session: () => Promise.resolve([{ balance: 150 }]),
    } as unknown as Aggregate<{ balance: number }[]>;
    (txModel.aggregate as jest.Mock).mockReturnValue(aggregateMock);

    const balance = await service.getBalance('1');
    expect(balance).toBe(150);
  });
});
