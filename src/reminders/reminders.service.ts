import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reminder } from './entities/reminder.entity';
import { Parent } from '../parents/entities/parent.entity';
import { ParentsService } from '../parents/parents.service';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private readonly remindersRepository: Repository<Reminder>,
    @Inject(forwardRef(() => ParentsService))
    private readonly parentsService: ParentsService,
  ) {}

  async create(parent: Parent, message: string) {
    const reminder = await this.remindersRepository.create({
      message,
      parent: { id: parent.id },
    });
    const savedReminder = await this.remindersRepository.save(reminder);
    this.parentsService.update(parent, { lastCreatedReminder: savedReminder });

    return savedReminder;
  }

  setParent(reminder: Reminder, parent: Parent) {
    this.remindersRepository.update(reminder, parent);
  }

  async updateReminderDueDate(reminder: Reminder, date: string) {
    const dateParts = date.trim().split('/');
    if (dateParts.length !== 3) {
      return 'Formato de data inválido. Por favor, use DD/MM/AAAA.';
    }

    const [day, month, year] = dateParts;
    const dueDate = new Date(`${year}-${month}-${day}`);
    if (isNaN(dueDate.getTime())) {
      return 'Data inválida. Por favor, verifique e envie novamente no formato DD/MM/AAAA.';
    }
    await this.remindersRepository.update(reminder.id, { dueDate });
  }

  async updateReminderDayTime(reminder: Reminder, dayTime: string) {
    const dayTimeParts = dayTime.trim().split(':');
    if (dayTimeParts.length !== 2) {
      return 'Formato de horário inválido. Por favor, use HH:MM.';
    }

    const [hours, minutes] = dayTimeParts.map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      return 'Formato de horário inválido. Por favor, use HH:MM.';
    }

    const dueDate = new Date(reminder.dueDate);
    dueDate.setHours(hours);
    dueDate.setMinutes(minutes);

    if (isNaN(dueDate.getTime())) {
      return 'Horário inválido. Por favor, verifique e envie novamente no formato HH:MM.';
    }

    await this.remindersRepository.update(reminder.id, { dueDate });
  }

  async findLastCreatedReminder(parent: Parent) {
    const foundParent = await this.parentsService.findByPhone(
      parent.phoneNumber,
    );
    return foundParent?.lastCreatedReminder;
  }

  findAll() {
    return this.remindersRepository.find({ relations: { parent: true } });
  }

  remove(reminder: Reminder) {
    return this.remindersRepository.remove(reminder);
  }
}
