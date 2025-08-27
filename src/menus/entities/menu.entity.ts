import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Option } from './option.entity';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => Option, { nullable: true })
  @JoinTable()
  options: Option[];

  @ManyToOne(() => Menu, { nullable: true })
  @JoinColumn()
  parentMenu: Menu;

  @Column()
  label: string;
}
