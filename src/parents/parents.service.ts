import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Parent } from './entities/parent.entity';
import { Repository } from 'typeorm';
import { Menu } from '../menus/entities/menu.entity';
import { Option } from '../menus/entities/option.entity';

@Injectable()
export class ParentsService {
  constructor(
    @InjectRepository(Parent)
    private readonly parentsRepository: Repository<Parent>,
  ) {}

  async register(phoneNumber: string) {
    const createdParent = this.parentsRepository.create({
      phoneNumber,
    });

    return await this.parentsRepository.save(createdParent);
  }

  findByPhone(phoneNumber: string) {
    return this.parentsRepository.findOne({
      where: { phoneNumber },
      relations: {
        currentMenu: {
          options: true,
        },
        lastChosenOption: true,
      },
    });
  }

  updateName(phoneNumber: string, name: string) {
    return this.parentsRepository.update({ phoneNumber }, { name });
  }

  updateCurrentMenu(phoneNumber: string, menu?: Menu) {
    return this.parentsRepository.update(
      { phoneNumber },
      { currentMenu: menu || null },
    );
  }

  async updateLastChosenOption(phoneNumber: string, option?: Option) {
    this.parentsRepository.update(
      { phoneNumber },
      { lastChosenOption: option || null },
    );
  }
}
