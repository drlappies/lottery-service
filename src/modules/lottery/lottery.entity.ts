import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Ticket } from '../ticket/ticket.entity';

export enum LotteryStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

@Entity()
@Index(['status', 'createdAt'])
export class Lottery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  result: string | null;

  @Column({ enum: LotteryStatus, default: LotteryStatus.IN_PROGRESS })
  status: LotteryStatus;

  @OneToMany(() => Ticket, (ticket) => ticket)
  tickets: Ticket[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
