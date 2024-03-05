import { Test } from '@nestjs/testing';
import { TicketService } from '../ticket.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketCache } from '../ticket.cache';
import { Ticket } from '../ticket.entity';
import { Lottery, LotteryStatus } from '../../lottery/lottery.entity';
import crypto from 'crypto';

describe('ticketService', () => {
  let ticketService: TicketService;
  let ticketRepo: Repository<Ticket>;
  let ticketCache: TicketCache;

  const mockLottery = {
    id: 'lotteryId',
    result: null,
    status: LotteryStatus.IN_PROGRESS,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTicket = {
    id: 'ticketId',
    result: 'adsfafieijesfesfe',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TicketService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: {
            save: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: TicketCache,
          useValue: {
            addTicket: jest.fn(),
            getTicketCount: jest.fn(),
            getRandomTicketId: jest.fn(),
          },
        },
      ],
    }).compile();

    ticketService = moduleRef.get<TicketService>(TicketService);
    ticketRepo = moduleRef.get<Repository<Ticket>>(getRepositoryToken(Ticket));
    ticketCache = moduleRef.get<TicketCache>(TicketCache);
  });

  it('should be defined', () => {
    expect(ticketService).toBeDefined();
    expect(ticketRepo).toBeDefined();
    expect(ticketCache).toBeDefined();
  });

  describe('generateTicket', () => {
    it('should generate a ticket, save to db, and add to the cache', async () => {
      jest.spyOn(ticketRepo, 'create').mockReturnValue(mockTicket as Ticket);

      await ticketService.generateTicket(mockLottery as Lottery);

      expect(ticketRepo.create).toHaveBeenCalled();

      expect(ticketRepo.save).toHaveBeenCalledWith(mockTicket);
      expect(ticketCache.addTicket).toHaveBeenCalledWith(mockTicket);
    });
  });

  describe('getWinnerTicket', () => {
    it('randomly select a ticket from the cache', async () => {
      jest.spyOn(ticketCache, 'getTicketCount').mockResolvedValue(10);
      jest
        .spyOn(ticketCache, 'getRandomTicketId')
        .mockResolvedValue('ticketId');
      jest.spyOn(ticketRepo, 'findOne').mockResolvedValue(mockTicket as Ticket);

      await ticketService.getWinnerTicket();

      expect(ticketCache.getTicketCount).toHaveBeenCalled();
      expect(ticketCache.getRandomTicketId).toHaveBeenCalled();
      expect(ticketRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'ticketId' },
      });
    });

    it('should not draw a ticket if there is no ticket in cache', async () => {
      jest.spyOn(ticketCache, 'getTicketCount').mockResolvedValue(0);

      await ticketService.getWinnerTicket();

      expect(ticketCache.getRandomTicketId).not.toHaveBeenCalled();
      expect(ticketRepo.findOne).not.toHaveBeenCalled();
    });
  });
});
