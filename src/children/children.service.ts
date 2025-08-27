import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child } from './entities/child.entity';
import { Parent } from '../parents/entities/parent.entity';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectRepository(Child)
    private readonly childrenRepository: Repository<Child>,
  ) {}
  async createChild(parent: Parent, childName: string) {
    const child = this.childrenRepository.create({
      name: childName,
      parent: { id: parent.id },
    });
    return await this.childrenRepository.save(child);
  }

  async updateChildDob(child: Child, dob: string) {
    const dateParts = dob.trim().split('/');
    if (dateParts.length !== 3) {
      return 'Formato de data inválido. Por favor, use DD/MM/AAAA.';
    }

    const [day, month, year] = dateParts;
    const birthDate = new Date(`${year}-${month}-${day}`);
    if (isNaN(birthDate.getTime())) {
      return 'Data inválida. Por favor, verifique e envie novamente no formato DD/MM/AAAA.';
    }
    await this.childrenRepository.update(child.id, { birthDate });
  }

  async removeChild(child: Child) {
    await this.childrenRepository.remove(child);
  }
}
