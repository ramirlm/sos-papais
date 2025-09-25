import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';

@Module({
  controllers: [],
  providers: [RemindersService],
})
export class RemindersModule {}
