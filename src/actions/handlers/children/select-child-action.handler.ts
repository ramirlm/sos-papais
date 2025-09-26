import { ParentsService } from '../../../parents/parents.service';
import { Action } from '../../../actions/abstractions/action.abstraction';
import { Parent } from '../../../parents/entities/parent.entity';

interface ISelectChildActionHandlerProps {
  parentsService: ParentsService;
  parent: Parent;
  lastChosenOptionId?: string;
  body: string;
}

export class SelectChildActionHandler extends Action<ISelectChildActionHandlerProps> {
  constructor(private readonly props: ISelectChildActionHandlerProps) {
    super();
  }
  async execute() {
    const {
      parentsService,
      parent,
      lastChosenOptionId,
      body,
    } = this.props;

    if (!parent.children || parent.children.length === 0) {
      return {
        response: 'Nenhuma criança disponível para seleção.',
        showMenuOnFinish: false,
      };
    }

    if (!parent.lastChosenOptionId) {
      parentsService.update(parent, {
        ...parent,
        lastChosenOptionId,
        conversationState: 'selecting_child',
      });
      return {
        response: `Por favor, selecione a criança.\n\n${parent.children
          .map((child, index) => `${index + 1}. ${child.name}`)
          .join('\n')}`,
        showMenuOnFinish: false,
      };
    }

    if (parent.conversationState === 'selecting_child') {
      const childIndex = parseInt(body) - 1;
      if (
        isNaN(childIndex) ||
        childIndex < 0 ||
        childIndex >= parent.children.length
      ) {
        return {
          response: `Opção inválida. Por favor, selecione uma criança válida.\n\n${parent.children
            .map((child, index) => `${index + 1}. ${child.name}`)
            .join('\n')}`,
          showMenuOnFinish: false,
        };
      }

      const selectedChild = parent.children[childIndex];
      parentsService.update(parent, {
        ...parent,
        currentChild: null,
        conversationState: '',
        currentMenuId: '',
        lastChosenOptionId: '',
      });

      return {
        response: `Criança selecionada: ${selectedChild.name}`,
        showMenuOnFinish: true,
      };
    }

    return {
      response: 'Voltando para o menu inicial...',
      showMenuOnFinish: true,
    };
  }
}
