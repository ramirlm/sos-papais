import { Action } from "../../actions/abstractions/action.abstraction";

export interface Menu {
    id: string;
    label: string;
    options: (Action | Menu)[];
}