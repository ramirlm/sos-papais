export abstract class Action {
    abstract execute(): { response: string, showMenuOnFinish: boolean };
}