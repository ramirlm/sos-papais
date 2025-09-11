import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Knowledge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column({ type: 'text', nullable: true })
  embedding: string;
}
