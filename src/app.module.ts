import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ThrottlerModule,
  ThrottlerGuard,
  ThrottlerModuleOptions,
  seconds,
} from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import validationSchema from './config/validation.schema';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema }),
    ThrottlerModule.forRoot(<ThrottlerModuleOptions>{
      throttlers: [
        {
          ttl: seconds(60),
          limit: 20,
        },
      ],
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({ uri: process.env.MONGO_URI }),
    }),
    AccountsModule,
    TransactionsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
