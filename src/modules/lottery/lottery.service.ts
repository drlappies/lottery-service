import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Lottery, LotteryStatus } from './lottery.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketService } from '../ticket/ticket.service';
import { Ticket } from '../ticket/ticket.entity';

@Injectable()
export class LotteryService {
  constructor(
    @InjectRepository(Lottery)
    private readonly lotteryRepository: Repository<Lottery>,
    private readonly ticketService: TicketService,
  ) {}

  async getLotteries(offset: number, limit: number): Promise<Lottery[]> {
    return this.lotteryRepository.find({ skip: offset, take: limit });
  }

  async startLottery(): Promise<void> {
    const latestLottery = await this.getLatestInProgressLottery();

    if (latestLottery) {
      return;
    }

    const lottery = this.lotteryRepository.create();
    await this.lotteryRepository.save(lottery);
  }

  async finishLottery(): Promise<void> {
    const latestLottery = await this.getLatestInProgressLottery();

    const ticket = await this.ticketService.getWinnerTicket();

    await this.lotteryRepository.update(
      { id: latestLottery.id },
      { status: LotteryStatus.FINISHED, result: ticket?.result },
    );

    await this.ticketService.discardTickets();
  }

  async restartLottery(): Promise<void> {
    await this.finishLottery();
    await this.startLottery();
  }

  async joinLottery(lotteryId: string): Promise<Ticket> {
    const lottery = await this.lotteryRepository.findOne({
      where: { id: lotteryId },
    });

    if (!lottery || lottery.status !== LotteryStatus.IN_PROGRESS) {
      throw new HttpException('Invalid lottery', HttpStatus.BAD_REQUEST);
    }

    const ticket = await this.ticketService.generateTicket(lottery);

    return ticket;
  }

  async getCurrentLottery(): Promise<Lottery> {
    return this.getLatestInProgressLottery();
  }

  async getLotteryById(lotteryId: string): Promise<Lottery> {
    const lottery = await this.lotteryRepository.findOne({
      where: { id: lotteryId },
    });

    return lottery;
  }

  async checkTicketResult(
    lotteryId: string,
    ticketId: string,
  ): Promise<boolean> {
    const ticket = await this.ticketService.getTicketById(ticketId);
    const lottery = await this.lotteryRepository.findOne({
      where: { id: lotteryId, result: ticket.result },
    });

    return Boolean(lottery);
  }

  async getLatestInProgressLottery(): Promise<Lottery> {
    return this.lotteryRepository.findOne({
      where: { status: LotteryStatus.IN_PROGRESS },
      order: { createdAt: 'DESC' },
    });
  }
}
