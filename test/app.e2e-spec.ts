import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

interface AccountResponse {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  religion: string;
  address?: string;
  type: 'savings' | 'checking' | 'business';
  isActive: boolean;
}

interface BalanceResponse {
  balance: number;
}

interface TransactionResponse {
  _id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
}

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  it('should create account, deposit, withdraw, and check balance', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/accounts')
      .send({
        fullName: 'Test',
        email: 't@e.com',
        phone: '123',
        nationality: 'X',
        religion: 'Y',
        type: 'savings',
      })
      .expect(201);

    const acct = createRes.body as AccountResponse;

    await request(app.getHttpServer())
      .post('/transactions')
      .send({ accountId: acct._id, type: 'deposit', amount: 200 })
      .expect(201);

    await request(app.getHttpServer())
      .post('/transactions')
      .send({ accountId: acct._id, type: 'withdraw', amount: 50 })
      .expect(201);

    const balanceRes = await request(app.getHttpServer())
      .get(`/accounts/${acct._id}/balance`)
      .expect(200);

    const balanceBody = balanceRes.body as BalanceResponse;
    expect(balanceBody.balance).toBe(150);
  });

  it('should not withdraw more than balance', async () => {
    const createRes2 = await request(app.getHttpServer())
      .post('/accounts')
      .send({
        fullName: 'Test2',
        email: 't2@e.com',
        phone: '456',
        nationality: 'Z',
        religion: 'W',
        type: 'checking',
      })
      .expect(201);

    const acct2 = createRes2.body as AccountResponse;

    const overRes = await request(app.getHttpServer())
      .post('/transactions')
      .send({ accountId: acct2._id, type: 'withdraw', amount: 100 })
      .expect(400);

    const err = overRes.body as {
      statusCode: number;
      message: string;
      error: string;
    };
    expect(err.message).toContain('Insufficient funds');
  });

  afterAll(async () => {
    await app.close();
  });
});
