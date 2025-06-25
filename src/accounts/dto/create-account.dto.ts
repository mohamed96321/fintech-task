import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty() @IsString() fullName: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() phone: string;
  @ApiProperty() @IsString() nationality: string;
  @ApiProperty() @IsString() religion: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() address?: string;
  @ApiProperty({ enum: ['savings', 'checking', 'business'] })
  @IsEnum(['savings', 'checking', 'business'])
  type: 'savings' | 'checking' | 'business';
}
