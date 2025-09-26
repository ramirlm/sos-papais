import { ParentsService } from '../../../parents/parents.service';
import { Action } from '../../../actions/abstractions/action.abstraction';
import { Parent } from '../../../parents/entities/parent.entity';
import { GeminiAiService } from 'src/gemini-ai/gemini-ai.service';

interface IAskAboutChildActionHandlerProps {
  parentsService: ParentsService;
  aiService: GeminiAiService;
  parent: Parent;
  lastChosenOptionId?: string;
  body: string;
}

export class AskAboutChildActionHandler extends Action<IAskAboutChildActionHandlerProps> {
  constructor(private readonly props: IAskAboutChildActionHandlerProps) {
    super();
  }
  async execute() {
    const { parentsService, aiService, parent, lastChosenOptionId, body } =
      this.props;

    if (!parent.currentChild) {
      return {
        response: 'Nenhuma criança selecionada.',
        showMenuOnFinish: true,
      };
    }

    if (!parent.lastChosenOptionId) {
      parentsService.update(parent, {
        ...parent,
        lastChosenOptionId,
        conversationState: 'asking_about_selected_child',
      });

      return {
        response: `Certo! Como posso ajudar com a criança selecionada: ${parent.currentChild.name}?`,
        showMenuOnFinish: false,
      };
    }

    if (parent.conversationState === 'asking_about_selected_child') {
      if (body === '0') {
        parentsService.update(parent, {
          ...parent,
          lastChosenOptionId: '',
          conversationState: '',
        });

        parentsService.update(parent, {
          ...parent,
          contextSummary: '',
          conversationState: '',
          lastChosenOptionId: '',
        });

        return {
          response: 'Voltando ao menu inicial...',
          showMenuOnFinish: true,
        };
      } else {
        const { aiResponse, updatedContextSummary } =
          await aiService.generateResponse(body, parent, parent.currentChild);

        parentsService.update(parent, {
          ...parent,
          contextSummary: updatedContextSummary,
        });

        return {
          response:
            aiResponse + '\n\nSe precisar voltar a o menu inicial, digite *0*.',
          showMenuOnFinish: false,
        };
      }
    }

    return {
      response: 'Voltando para o menu inicial...',
      showMenuOnFinish: true,
    };
  }
}
