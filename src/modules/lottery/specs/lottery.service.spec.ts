import { Test } from '@nestjs/testing';
import { LotteryService } from '../lottery.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lottery, LotteryStatus } from '../lottery.entity';
import { TicketService } from '../../ticket/ticket.service';

describe('LotteryService', () => {
  let lotteryService: LotteryService;
  let lotteryRepo: Repository<Lottery>;
  let ticketService: TicketService;

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
        LotteryService,
        {
          provide: getRepositoryToken(Lottery),
          useValue: {
            create: jest.fn().mockReturnValue(mockLottery),
            save: jest.fn().mockResolvedValue(mockLottery),
            update: jest.fn().mockResolvedValue(mockLottery),
            findOne: jest.fn().mockResolvedValue(mockLottery),
          },
        },
        {
          provide: TicketService,
          useValue: {
            getWinnerTicket: jest.fn().mockResolvedValue(mockTicket),
            discardTickets: jest.fn().mockResolvedValue(null),
            generateTicket: jest.fn().mockResolvedValue(mockTicket),
          },
        },
      ],
    }).compile();

    lotteryService = moduleRef.get<LotteryService>(LotteryService);
    lotteryRepo = moduleRef.get<Repository<Lottery>>(
      getRepositoryToken(Lottery),
    );
    ticketService = moduleRef.get<TicketService>(TicketService);
  });

  it('should be defined', () => {
    expect(lotteryService).toBeDefined();
    expect(lotteryRepo).toBeDefined();
    expect(ticketService).toBeDefined();
  });

  describe('startLottery', () => {
    it('should save lottery to db', async () => {
      jest
        .spyOn(lotteryService, 'getLatestInProgressLottery')
        .mockResolvedValue(null);

      await lotteryService.startLottery();

      expect(lotteryService.getLatestInProgressLottery).toHaveBeenCalled();
      expect(lotteryRepo.create).toHaveBeenCalled();
      expect(lotteryRepo.save).toHaveBeenCalled();
    });

    it('should not start a lottery if there is an in-progress lottery', async () => {
      jest
        .spyOn(lotteryService, 'getLatestInProgressLottery')
        .mockResolvedValue(mockLottery as Lottery);
      await lotteryService.startLottery();

      expect(lotteryRepo.create).not.toHaveBeenCalled();
      expect(lotteryRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('finishLottery', () => {
    it('should draw a ticket, update the lottery status and result, and discard all tickets', async () => {
      jest
        .spyOn(lotteryService, 'getLatestInProgressLottery')
        .mockResolvedValue(mockLottery as Lottery);
      await lotteryService.finishLottery();

      expect(ticketService.getWinnerTicket).toHaveBeenCalled();
      expect(lotteryRepo.update).toHaveBeenCalledWith(
        { id: mockLottery.id },
        { status: LotteryStatus.FINISHED, result: mockTicket.result },
      );
      expect(ticketService.discardTickets).toHaveBeenCalledWith();
    });
  });

  describe('restartLottery', () => {
    it('should finishLottery() then startLottery() to start a lottery loop', async () => {
      jest.spyOn(lotteryService, 'finishLottery').mockResolvedValue();
      jest.spyOn(lotteryService, 'startLottery').mockResolvedValue();
      await lotteryService.restartLottery();
      expect(lotteryService.finishLottery).toHaveBeenCalled();
      expect(lotteryService.startLottery).toHaveBeenCalled();
    });
  });

  describe('joinLottery', () => {
    it('should return a ticket to the user after joining the lottery', async () => {
      await lotteryService.joinLottery('lotteryId');

      expect(lotteryRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'lotteryId' },
      });
      expect(ticketService.generateTicket).toHaveBeenCalledWith(mockLottery);
    });

    it('should not generate ticket if the lottery is not in progress', async () => {
      jest.spyOn(lotteryRepo, 'findOne').mockResolvedValue({
        ...mockLottery,
        status: LotteryStatus.FINISHED,
      } as Lottery);

      expect(lotteryService.joinLottery('lotteryId')).rejects.toThrow();
      expect(ticketService.generateTicket).not.toHaveBeenCalled();
    });

    it('should not generate ticket if the lottery is not found', async () => {
      jest.spyOn(lotteryRepo, 'findOne').mockResolvedValue(null);
      expect(lotteryService.joinLottery('lotteryId')).rejects.toThrow();
      expect(ticketService.generateTicket).not.toHaveBeenCalled();
    });
  });
});
