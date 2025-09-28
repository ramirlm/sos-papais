import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Parent } from './entities/parent.entity';
import { Repository } from 'typeorm';
import { ChildrenService } from '../children/children.service';
import { RemindersService } from '../reminders/reminders.service';

@Injectable()
export class ParentsService {
  constructor(
    @InjectRepository(Parent)
    private readonly parentsRepository: Repository<Parent>,
    private readonly childrenService: ChildrenService,
    private readonly remindersService: RemindersService,
  ) {}

  async register({
    phoneNumber,
    message,
  }: {
    phoneNumber: string;
    message: string;
  }) {
    const parent = await this.findByPhone(phoneNumber);
    if (!parent) {
      const createdParent = this.parentsRepository.create({
        phoneNumber,
      });

      await this.parentsRepository.save(createdParent);

      return await this.findByPhone(phoneNumber);
    } else {
      await this.update(parent, { name: message });
      return await this.findByPhone(phoneNumber);
    }
  }

  findByPhone(phoneNumber: string) {
    return this.parentsRepository.findOne({
      where: { phoneNumber },
      relations: {
        children: true,
        currentChild: true,
        reminders: true,
        lastCreatedReminder: true,
      },
    });
  }

  async update(
    parent: Parent,
    { children, reminders, ...updateParentDto }: Partial<Parent>,
  ) {
    if (children && children != parent.children) {
      for (let child of children) {
        this.childrenService.setParent(child, parent);
      }
    }
    if (reminders && reminders != parent.reminders) {
      for (let reminder of reminders) {
        this.remindersService.setParent(reminder, parent);
      }
    }
    await this.parentsRepository.update(
      { phoneNumber: parent.phoneNumber },
      updateParentDto,
    );
  }
}
