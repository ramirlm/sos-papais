import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reminder } from './entities/reminder.entity';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private readonly remindersRepository: Repository<Reminder>,
  ) {}

  findAll() {
    return this.remindersRepository.find({ relations: { parent: true } });
  }

  remove(reminder: Reminder) {
    return this.remindersRepository.remove(reminder);
  }
}
