import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { Ticket } from './ticket.entity';

const TICKET_POOL_KEY = 'ticket:pool';

@Injectable()
export class TicketCache {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async addTicket(ticket: Ticket): Promise<void> {
    await this.redis.sadd(TICKET_POOL_KEY, ticket.id);
  }

  async discardTickets(): Promise<void> {
    await this.redis.del(TICKET_POOL_KEY);
  }

  async getTicketCount(): Promise<number> {
    return this.redis.scard(TICKET_POOL_KEY);
  }

  async getRandomTicketId(): Promise<string> {
    return this.redis.srandmember(TICKET_POOL_KEY);
  }
}
