import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reminder } from './entities/reminder.entity';
import { ParentsService } from '../parents/parents.service';
import { Parent } from '../parents/entities/parent.entity';
import { ChildrenService } from '../children/children.service';
import { Child } from '../children/entities/child.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reminder, Parent, Child])],
  controllers: [],
  providers: [RemindersService, ParentsService, ChildrenService],
  exports: [RemindersService],
})
export class RemindersModule {}
