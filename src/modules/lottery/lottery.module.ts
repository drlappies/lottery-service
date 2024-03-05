import { Module } from '@nestjs/common';
import { LotteryController } from './lottery.controller';
import { LotterySchedular } from './lottery.schedular';
import { LotteryService } from './lottery.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lottery } from './lottery.entity';
import { TicketModule } from '../ticket/ticket.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lottery]), TicketModule],
  controllers: [LotteryController],
  providers: [LotterySchedular, LotteryService],
  exports: [LotterySchedular, LotteryService],
})
export class LotteryModule {}
