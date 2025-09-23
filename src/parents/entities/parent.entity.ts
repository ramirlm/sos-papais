import { Knowledge } from '../../knowledges/entities/knowledge.entity';
import { Child } from '../../children/entities/child.entity';
import { Menu } from '../../menus/entities/menu.entity';
import { Option } from '../../menus/entities/option.entity';
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

  @Column()
  phoneNumber: string;

  @Column()
  createdAt: Date;

  @OneToMany(() => Child, (child) => child.parent, { cascade: true })
  children: Child[];

  @OneToOne(() => Child, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  currentChild: Child | null;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  lastQuestion: string;

  @Column({ nullable: true })
  lastResponse: string;

  @ManyToOne(() => Option, { nullable: true })
  @JoinColumn()
  lastChosenOption: Option | null;

  @ManyToOne(() => Knowledge, { nullable: true })
  @JoinColumn()
  lastUsedKnowledge: Knowledge;

  @Column({nullable: true})
  contextSummary: string;

  @ManyToOne(() => Menu, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  currentMenu: Menu | null;

  @Column({ nullable: true })
  conversationState?: string;
}
