import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Parent } from './entities/parent.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ParentsService {
  constructor(
    @InjectRepository(Parent)
    private readonly parentsRepository: Repository<Parent>,
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
      await this.update(parent, { ...parent, name: message });
      return await this.findByPhone(phoneNumber);
    }
  }

  findByPhone(phoneNumber: string) {
    return this.parentsRepository.findOne({
      where: { phoneNumber },
      relations: {
        children: true,
        currentChild: true,
      },
    });
  }

  update(parent: Parent, updateParentDto: Parent) {
    return this.parentsRepository.update({ id: parent.id }, updateParentDto);
  }
}
