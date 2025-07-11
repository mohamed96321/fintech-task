import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { BalanceResponseDto } from './dto/balance-response.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly service: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Open a new bank account' })
  create(@Body() dto: CreateAccountDto) {
    return this.service.create(dto);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Check account balance' })
  async getBalance(@Param('id') id: string): Promise<BalanceResponseDto> {
    const balance = await this.service.getBalance(id);
    return { balance };
  }

  @Patch(':id/freeze')
  @ApiOperation({ summary: 'Freeze an account' })
  freeze(@Param('id') id: string) {
    return this.service.setAccountStatus(id, false);
  }

  @Patch(':id/unfreeze')
  @ApiOperation({ summary: 'Unfreeze an account' })
  unfreeze(@Param('id') id: string) {
    return this.service.setAccountStatus(id, true);
  }
}
