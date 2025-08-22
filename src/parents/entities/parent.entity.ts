import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ nullable: true })
  conversationState: string;

  @Column({ nullable: true })
  lastMessage?: string;

  @Column({ nullable: true })
  lastChosenOption?: string;

  @Column({ nullable: true })
  menuState: string;
}
