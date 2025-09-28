import { ParentsService } from '../../../parents/parents.service';
import { ChildrenService } from '../../../children/children.service';
import { Action } from '../../../actions/abstractions/action.abstraction';
import { Parent } from '../../../parents/entities/parent.entity';

interface IAddChildActionHandlerProps {
  parentsService: ParentsService;
  childrenService: ChildrenService;
  parent: Parent;
  lastChosenOptionId?: string;
  body: string;
}

export class AddChildActionHandler extends Action<IAddChildActionHandlerProps> {
  constructor() {
    super();
  }
  async execute(props: IAddChildActionHandlerProps) {
    const {
      parentsService,
      childrenService,
      parent,
      lastChosenOptionId,
      body,
    } = props;

    if (!parent.lastChosenOptionId) {
      parentsService.update(parent, { lastChosenOptionId });
      return {
        response: 'Por favor, envie o nome da criança.',
        finished: false,
      };
    }

    if (!parent.conversationState) {
      const child = await childrenService.createChild(parent, body);

      parentsService.update(parent, {
        conversationState: 'waiting_for_dob',
      });

      parentsService.update(parent, { currentChild: child });

      return {
        response:
          'Certo! Agora envie a data de nascimento da criança. (DD/MM/AAAA)',
        finished: false,
      };
    }

    if (parent.conversationState === 'waiting_for_dob') {
      if (!parent.currentChild) {
        return {
          response: 'Nenhuma criança selecionada.',
          finished: false,
        };
      }

      const response = await childrenService.updateChildDob(
        parent.currentChild,
        body,
      );

      if (response) return { response, finished: false };

      parentsService.update(parent, {
        conversationState: '',
        lastChosenOptionId: '',
      });

      return {
        response: 'Data de nascimento da criança atualizada com sucesso.',
        finished: true,
      };
    }

    parentsService.update(parent, {
      conversationState: '',
      lastChosenOptionId: '',
    });

    return {
      response: 'Voltando para o menu inicial...',
      finished: true,
    };
  }
}
