import { Parent } from '../../parents/entities/parent.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Child {
  constructor() {
    this.createdAt = new Date();
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name?: string;

  @ManyToOne((type) => Parent, (parent) => parent.children)
  @JoinColumn()
  parent: Parent;

  @Column({ nullable: true })
  birthDate: Date;

  @Column()
  createdAt: Date;
}
