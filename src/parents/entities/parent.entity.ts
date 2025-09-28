import { Reminder } from '../../reminders/entities/reminder.entity';
import { Child } from '../../children/entities/child.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Parent {
  constructor() {
    this.createdAt = new Date();
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column()
  phoneNumber: string;

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  lastChosenOptionId?: string;

  @Column({ nullable: true })
  currentMenuId?: string;

  @Column({ nullable: true })
  conversationState?: string;

  @Column({ nullable: true })
  contextSummary: string;

  @OneToMany(() => Child, (child) => child.parent, { cascade: true })
  children: Child[];

  @OneToMany(() => Reminder, (reminder) => reminder.parent, { cascade: true })
  reminders: Reminder[];

  @OneToOne(() => Reminder, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  lastCreatedReminder: Reminder | null;

  @OneToOne(() => Child, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  currentChild: Child | null;
}
