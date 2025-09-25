import { Parent } from "../../parents/entities/parent.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Reminder {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    dueDate: Date;

    @Column()
    message: string;
    
    @ManyToOne(() => Parent, (parent) => parent.reminders, { onDelete: 'CASCADE' })
    parent: Parent;
}
