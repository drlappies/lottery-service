import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketService } from './ticket.service';
import { TicketCache } from './ticket.cache';
import { Ticket } from './ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  providers: [TicketService, TicketCache],
  exports: [TicketService, TicketCache],
})
export class TicketModule {}
