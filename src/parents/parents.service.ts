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

  async register(phoneNumber: string) {
    const createdParent = this.parentsRepository.create({
      phoneNumber,
    });

    return await this.parentsRepository.save(createdParent);
  }

  findByPhone(phoneNumber: string) {
    return this.parentsRepository.findOne({
      where: { phoneNumber },
    });
  }

  updateName(phoneNumber: string, name: string) {
    return this.parentsRepository.update({ phoneNumber }, { name });
  }
}
