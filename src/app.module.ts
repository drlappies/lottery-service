import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LotteryModule } from './modules/lottery/lottery.module';
import config from './config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Lottery } from './modules/lottery/lottery.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { Ticket } from './modules/ticket/ticket.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('postgres'),
        synchronize: true,
        entities: [Lottery, Ticket],
      }),
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        config: configService.get('redis'),
      }),
    }),
    ScheduleModule.forRoot(),
    LotteryModule,
  ],
})
export class AppModule {}
