import { ActionResult } from '../interfaces/completed-action.interface';

export abstract class Action<T = {}> {
  abstract execute(props: T): Promise<ActionResult>;
}
