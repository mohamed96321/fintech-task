import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AccountDocument = Account & Document;

@Schema({ timestamps: true })
export class Account {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  nationality: string;

  @Prop({ required: true })
  religion: string;

  @Prop()
  address?: string;

  @Prop({ required: true, enum: ['savings', 'checking', 'business'] })
  type: 'savings' | 'checking' | 'business';

  @Prop({ default: true })
  isActive: boolean;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
