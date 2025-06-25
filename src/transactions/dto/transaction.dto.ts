import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, Min } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty() @IsString() accountId: string;
  @ApiProperty({ enum: ['deposit', 'withdraw'] })
  @IsEnum(['deposit', 'withdraw'])
  type: 'deposit' | 'withdraw';
  @ApiProperty() @IsNumber() @Min(0.01) amount: number;
}
