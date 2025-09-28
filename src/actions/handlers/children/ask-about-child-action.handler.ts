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
  constructor() {
    super();
  }
  async execute(props: IAskAboutChildActionHandlerProps) {
    const { parentsService, aiService, parent, lastChosenOptionId, body } =
      props;

    if (!parent.currentChild) {
      return {
        response: 'Nenhuma criança selecionada.',
        finished: true,
      };
    }

    if (!parent.lastChosenOptionId) {
      parentsService.update(parent, {
        lastChosenOptionId,
        conversationState: 'asking_about_selected_child',
      });

      return {
        response: `Certo! Como posso ajudar com a criança selecionada: ${parent.currentChild.name}?`,
        finished: false,
      };
    }

    if (parent.conversationState === 'asking_about_selected_child') {
      if (body === '0') {
        parentsService.update(parent, {
          lastChosenOptionId: '',
          conversationState: '',
        });

        parentsService.update(parent, {
          contextSummary: '',
          conversationState: '',
          lastChosenOptionId: '',
        });

        return {
          response: 'Voltando ao menu inicial...',
          finished: true,
        };
      } else {
        const { aiResponse, updatedContextSummary } =
          await aiService.generateResponse(body, parent, parent.currentChild);

        parentsService.update(parent, {
          contextSummary: updatedContextSummary,
        });

        return {
          response:
            aiResponse + '\n\nSe precisar voltar a o menu inicial, digite *0*.',
          finished: false,
        };
      }
    }

    return {
      response: 'Voltando para o menu inicial...',
      finished: true,
    };
  }
}
