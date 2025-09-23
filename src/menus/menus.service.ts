import { Injectable } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { Option } from './entities/option.entity';
import { Repository } from 'typeorm';
import { Parent } from '../parents/entities/parent.entity';
import { ParentsService } from '../parents/parents.service';
import { ChildrenService } from '../children/children.service';
import { GeminiAiService } from '../gemini-ai/gemini-ai.service';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu) private readonly menusRepository: Repository<Menu>,
    @InjectRepository(Option)
    private readonly optionsRepository: Repository<Option>,
    private readonly parentsService: ParentsService,
    private readonly childrenService: ChildrenService,
    private readonly aiService: GeminiAiService,
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
        { label: 'Adicionar nova criança' },
        { label: 'Selecionar criança' },
        { label: 'Deletar criança selecionada' },
        { label: 'Perguntar sobre a criança selecionada' },
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
        return {response :'Seu nome foi alterado com sucesso.', sendMenu: true};
      }
      case 'Adicionar nova criança':
        if (!parent.lastChosenOption) {
          this.parentsService.updateLastChosenOption(
            parent.phoneNumber,
            selectedOption,
          );
          return 'Por favor, envie o nome da criança.';
        }
        if (!parent.conversationState) {
          const child = await this.childrenService.createChild(parent, body);
          this.parentsService.updateConversationState(
            parent.phoneNumber,
            'waiting_for_dob',
          );
          this.parentsService.updateCurrentChild(parent.phoneNumber, child);
          return 'Certo! Agora envie a data de nascimento da criança. (DD/MM/AAAA)';
        }
        if (parent.conversationState === 'waiting_for_dob') {
          if (!parent.currentChild) {
            return 'Nenhuma criança selecionada.';
          }
          const result = await this.childrenService.updateChildDob(
            parent.currentChild,
            body,
          );
          if (result) return result;
          this.parentsService.updateConversationState(parent.phoneNumber);
          this.parentsService.updateCurrentMenu(parent.phoneNumber);
          this.parentsService.updateLastChosenOption(parent.phoneNumber);
          return {response: 'Data de nascimento da criança atualizada com sucesso.', sendMenu: true};
        }
      case 'Deletar criança selecionada': {
        if (!parent.currentChild) {
          return 'Nenhuma criança selecionada.';
        }
        await this.childrenService.removeChild(parent.currentChild);
        this.parentsService.updateCurrentChild(parent.phoneNumber);
        this.parentsService.updateConversationState(parent.phoneNumber);
        this.parentsService.updateCurrentMenu(parent.phoneNumber);
        this.parentsService.updateLastChosenOption(parent.phoneNumber);
        return {response: 'Criança removida com sucesso.', sendMenu: true};
      }
      case 'Selecionar criança': {
        if (!parent.children || parent.children.length === 0) {
          return 'Nenhuma criança disponível para seleção.';
        }
        if (!parent.lastChosenOption) {
          this.parentsService.updateLastChosenOption(
            parent.phoneNumber,
            selectedOption,
          );
          this.parentsService.updateConversationState(
            parent.phoneNumber,
            'selecting_child',
          );
          return `Por favor, selecione a criança.\n\n${parent.children
            .map((child, index) => `${index + 1}. ${child.name}`)
            .join('\n')}`;
        }

        if (parent.conversationState === 'selecting_child') {
          const childIndex = parseInt(body) - 1;
          if (
            isNaN(childIndex) ||
            childIndex < 0 ||
            childIndex >= parent.children.length
          ) {
            return `Opção inválida. Por favor, selecione uma criança válida.\n\n${parent.children
              .map((child, index) => `${index + 1}. ${child.name}`)
              .join('\n')}`;
          }

          const selectedChild = parent.children[childIndex];
          this.parentsService.updateCurrentChild(
            parent.phoneNumber,
            selectedChild,
          );
          this.parentsService.updateConversationState(parent.phoneNumber);
          this.parentsService.updateCurrentMenu(parent.phoneNumber);
          this.parentsService.updateLastChosenOption(parent.phoneNumber);
          return {response: `Criança selecionada: ${selectedChild.name}`, sendMenu: true};
        }
      }
      case 'Perguntar sobre a criança selecionada': {
        if (!parent.currentChild) {
          return 'Nenhuma criança selecionada.';
        }
        if (!parent.lastChosenOption) {
          this.parentsService.updateLastChosenOption(
            parent.phoneNumber,
            selectedOption,
          );
          this.parentsService.updateConversationState(
            parent.phoneNumber,
            'asking_about_selected_child',
          );
          return `Certo! Como posso ajudar com a criança selecionada: ${parent.currentChild.name}?`;
        }
        if (parent.conversationState === 'asking_about_selected_child') {
          const response = await this.aiService.generateResponse(
            body,
            parent,
            parent.currentChild,
          );
          this.parentsService.updateConversationState(parent.phoneNumber);
          this.parentsService.updateCurrentMenu(parent.phoneNumber);
          this.parentsService.updateLastChosenOption(parent.phoneNumber);
          return response;
        }
      }
      default:
        break;
    }
  }
}
