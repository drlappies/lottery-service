import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { LotteryService } from './lottery.service';
import { Lottery } from './lottery.entity';
import { Ticket } from '../ticket/ticket.entity';

@Controller('/lottery')
export class LotteryController {
  constructor(private readonly lotteryService: LotteryService) {}

  @Get('/')
  getLotteries(
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<Lottery[]> {
    return this.lotteryService.getLotteries(offset, limit);
  }

  @Get('/current')
  getCurrentLottery(): Promise<Lottery> {
    return this.lotteryService.getCurrentLottery();
  }

  @Get('/:id/ticket/:ticket_id')
  checkTicketResult(
    @Param('id') lotteryId: string,
    @Param('ticket_id') ticketId: string,
  ): Promise<boolean> {
    return this.lotteryService.checkTicketResult(lotteryId, ticketId);
  }

  @Get('/:id')
  getLotteryById(@Param('id') id: string): Promise<Lottery> {
    return this.lotteryService.getLotteryById(id);
  }

  @Post('/:id/join')
  joinLottery(@Param('id') id: string): Promise<Ticket> {
    return this.lotteryService.joinLottery(id);
  }
}
