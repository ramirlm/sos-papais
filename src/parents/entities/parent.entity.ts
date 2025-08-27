import { Menu } from '../../menus/entities/menu.entity';
import { Option } from '../../menus/entities/option.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
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

  @Column({ nullable: true })
  name: string;

  @OneToOne(() => Option, { nullable: true })
  @JoinColumn()
  lastChosenOption: Option | null;

  @ManyToOne(() => Menu, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  currentMenu: Menu | null;
}
