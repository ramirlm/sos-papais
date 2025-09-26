import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Parent } from './entities/parent.entity';
import { Repository } from 'typeorm';
import { ChildrenService } from '../children/children.service';

@Injectable()
export class ParentsService {
  constructor(
    @InjectRepository(Parent)
    private readonly parentsRepository: Repository<Parent>,
    private readonly childrenService: ChildrenService,
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

  async update(parent: Parent, { children, ...updateParentDto }: Parent) {
    if (children != parent.children) {
      for (let child of children) {
        this.childrenService.setParent(child, parent);
      }
    }
    await this.parentsRepository.update(
      { phoneNumber: parent.phoneNumber },
      updateParentDto,
    );
  }
}
