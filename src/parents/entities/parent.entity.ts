import { Child } from '../../children/entities/child.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
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

  @OneToOne(() => Child, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  currentChild: Child | null;
}
