import { Entity } from "../../common/models";
import { ConfigParams, ModalData, UrlEntities, UrlParams } from "..";


export type IconType = "outlined" | "filled" | "round";

export type ActionStateMap = Record<string, ActionState>;

export type ActionStates = Record<string, (params: Partial<ConfigParams>) => string>;

export type EntityActionType = 'icon' | 'switch' | 'radio' | 'checkbox' | 'menu' | 'chip';

// ===================== MAIN =====================

export interface InvokeActionParams<T extends Entity> {
  action: EntityAction;
  url: UrlParams;
  context?: UrlEntities;
  entity?: T;
  data?: string;
  forTemplates: boolean;
  dialogSettings?: Partial<ModalData>;
};

export interface ActionState {
  value: (params: Partial<ConfigParams>) => string | boolean | number | null; // string -> icon
  label?: (params: Partial<ConfigParams>) => string;
  classes?: string[];
  styles?: (params: Partial<ConfigParams>) => any;
  icon?: IconType;
};

export interface EntityAction {
  id: string;
  type: (params: Partial<ConfigParams>) => EntityActionType;

  states: ActionStateMap;
  hidden?: (params: Partial<ConfigParams>) => boolean;
  color?: (params: Partial<ConfigParams>) => 'primary' | 'accent' | 'warn'; // for switch/checkbox/radio
  disabled?: (params: Partial<ConfigParams>) => boolean; // for switch/checkbox/radio
  disabledHint?: (params: Partial<ConfigParams>) => string; // for switch/checkbox/radio
  submenu?: (params: Partial<ConfigParams>) => string[];
  submenuChoice?: (params: Partial<ConfigParams>) => boolean;
  standalone?: boolean; // hide from doc actions menu
  property?: string; // related property, primarily used with sort
  noDismiss?: boolean; // disable auto-dismiss on menu button click
  trailingIcon?: boolean; // display icon to the right in menues
};
