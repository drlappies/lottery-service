import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';

import { LotteryService } from './lottery.service';

export enum LotterySchedule {
  LOTTERY_LOOP = 'LOTTERY_LOOP',
}

@Injectable()
export class LotterySchedular implements OnModuleInit {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
    private readonly lotteryService: LotteryService,
  ) {}

  onModuleInit(): void {
    this.runLotteryLoop();
  }

  async runLotteryLoop(): Promise<void> {
    await this.lotteryService.startLottery();

    this.schedulerRegistry.addInterval(
      LotterySchedule.LOTTERY_LOOP,
      setInterval(
        async () => await this.lotteryService.restartLottery(),
        this.configService.get('lottery.life'),
      ),
    );
  }
}
