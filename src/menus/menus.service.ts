import { Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { Option } from './entities/option.entity';
import { Repository } from 'typeorm';
import { Parent } from '../parents/entities/parent.entity';
import { ParentsService } from '../parents/parents.service';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu) private readonly menusRepository: Repository<Menu>,
    @InjectRepository(Option)
    private readonly optionsRepository: Repository<Option>,
    private readonly parentsService: ParentsService,
  ) {
    this.handleInitialMenuCreation();
  }
  create(createMenuDto: CreateMenuDto) {
    return `This action create a new menu`;
  }

  findAll() {
    return `This action returns all menus`;
  }

  findOne(id: number) {
    return this.menusRepository.findOne({
      where: { id },
      relations: {
        options: true,
      },
    });
  }

  findInitialMenu() {
    return this.menusRepository.findOne({
      where: {
        parentMenu: undefined,
      },
      relations: {
        options: true,
      },
    });
  }

  update(id: number, updateMenuDto: UpdateMenuDto) {
    return `This action updates a #${id} menu`;
  }

  remove(id: number) {
    return `This action removes a #${id} menu`;
  }

  async handleInitialMenuCreation() {
    const foundMenu = await this.menusRepository.findOne({
      where: {
        parentMenu: undefined,
      },
    });

    if (!foundMenu) {
      const options = this.optionsRepository.create([
        { label: 'Alterar meu nome' },
        { label: 'Adicionar criança' },
        { label: 'Remover criança' },
        { label: 'Selecionar criança' },
      ]);

      const savedOptions = await this.optionsRepository.save(options);

      const firstMenu = this.menusRepository.create({
        options: savedOptions,
        label: 'initial_menu',
      });

      await this.menusRepository.save(firstMenu);
    }
  }

  async initial_menu(menu: Menu, option: Option, parent: Parent, body: string) {
    const selectedOption = menu.options.find((opt) => opt.id === option.id);
    if (!selectedOption) return;

    switch (selectedOption.label) {
      case 'Alterar meu nome': {
        if (!parent.lastChosenOption) {
          this.parentsService.updateLastChosenOption(
            parent.phoneNumber,
            selectedOption,
          );
          return 'Por favor, envie seu nome completo.';
        }
        this.parentsService.updateCurrentMenu(parent.phoneNumber);
        this.parentsService.updateLastChosenOption(parent.phoneNumber);
        this.parentsService.updateName(parent.phoneNumber, body);
        return 'Seu nome foi alterado com sucesso.';
      }
      case 'Adicionar criança':
        // Handle adding child
        break;
      case 'Remover criança':
        // Handle removing child
        break;
      case 'Selecionar criança':
        // Handle selecting child
        break;
      default:
        break;
    }
  }
}
