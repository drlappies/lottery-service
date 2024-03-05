import { Injectable } from '@nestjs/common';
import { Ticket } from './ticket.entity';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lottery } from '../lottery/lottery.entity';
import { TicketCache } from './ticket.cache';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly ticketCache: TicketCache,
  ) {}

  async generateTicket(lottery: Lottery): Promise<Ticket> {
    const ticket = this.ticketRepository.create({
      lottery,
      result: randomBytes(64).toString('hex'),
    });

    await this.ticketRepository.save(ticket);
    await this.ticketCache.addTicket(ticket);

    return ticket;
  }

  async getWinnerTicket(): Promise<Ticket> {
    const ticketCount = await this.ticketCache.getTicketCount();

    if (ticketCount <= 0) {
      return null;
    }

    const randomTicketId = await this.ticketCache.getRandomTicketId();

    const ticket = await this.ticketRepository.findOne({
      where: { id: randomTicketId },
    });

    return ticket;
  }

  async discardTickets(): Promise<void> {
    await this.ticketCache.discardTickets();
  }

  async getTicketById(ticketId: string): Promise<Ticket> {
    return this.ticketRepository.findOne({ where: { id: ticketId } });
  }
}
