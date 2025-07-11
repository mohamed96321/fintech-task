import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true }) accountId: string;
  @Prop({ required: true, enum: ['deposit', 'withdraw'] })
  type: 'deposit' | 'withdraw';
  @Prop({ required: true, min: 0.01 })
  amount: number;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
