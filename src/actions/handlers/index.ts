import { AddChildActionHandler } from './children/add-child-action.handler';
import { AskAboutChildActionHandler } from './children/ask-about-child-action.handler';
import { DeleteChildActionHandler } from './children/delete-child-action.handler';
import { SelectChildActionHandler } from './children/select-child-action.handler';
import { AddReminderActionHandler } from './reminders/add-reminder-action.handler';
import { UpdateNameActionHandler } from './user/update-name-action.handler';

export const ActionHandlers = [
  UpdateNameActionHandler,
  AddChildActionHandler,
  AskAboutChildActionHandler,
  DeleteChildActionHandler,
  SelectChildActionHandler,
  AddReminderActionHandler,
];
