import { PaginatorSettings, SelectOption, ChipConfig, IconType } from "./framework.models";
import { OverviewDisplayType, ConfigParams, SortType, SortDirection } from "./library.models";

// ===================== DEFINITIONS =====================

export interface QuerySettings {
  paginator: PaginatorSettings;

  /**
    * used in entity repository to provide an alternative to stats.createdAt
    */
  defaultOrderByField?: string;

  filters: EntityFilter[];
  tabFilters: EntityFilter[];
  sectionFilters: EntityFilter[];
  viewFilters: { [filterId: string]: EntityFilter };
};

export interface EntitySettings {
  displayTypes: OverviewDisplayType[];
  selectedFormIdx: number;
  categories?: SelectOption[]; // value -> icon

  toolbarChips?: (params: Partial<ConfigParams>) => ChipConfig[];
  showToolbarChips?: (params: Partial<ConfigParams>) => boolean;
  showToolbarPinnedAction?: (params: Partial<ConfigParams>) => boolean;
  showTableQuickAction?: (params: Partial<ConfigParams>) => boolean;
  showCardQuickAction?: (params: Partial<ConfigParams>) => boolean;
}

export interface ViewSettings {
  displayType: OverviewDisplayType;

  hiddenMap: VisibilitySettings;
  hideSidenav: boolean;

  sort: SortSettings;

  selectedTemplateId?: string;
  tableQuickActionId: string;
  cardQuickActionId: string;
  toolbarPinnedActionId: string;
};

export type VisibilitySettings = {
  [key: string]: boolean;
}

export interface SortSettings {
  sortType: SortType | null;
  sortDirection: SortDirection;
  sortProperty?: string;

  tableSortProperty: string | null;
  tableSortDirection: SortDirection;
};

export interface EntityActionState {
  value: (params: Partial<ConfigParams>) => string | boolean | number | null; // string -> icon
  label?: (params: Partial<ConfigParams>) => string;
  classes?: string[];
  styles?: (params: Partial<ConfigParams>) => any;
  icon?: IconType;
};

export type EntityActionStateMap = {
  [stateId: string]: EntityActionState;
};

export type EntityActionStates = {
  [actionId: string]: (params: Partial<ConfigParams>) => string; // stateId
};

export interface EntityAction {
  id: string;
  type: (params: Partial<ConfigParams>) => EntityActionType;

  states: EntityActionStateMap;
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

export type EntityActionType = 'icon' | 'switch' | 'radio' | 'checkbox' | 'menu' | 'chip';

export interface EntityFilter {
  name: string;
  property: string;
  value: string | boolean | Array<any> | null;
  range?: {
    min?: number;
    max?: number;
    exclusive?: boolean;
  }
  equality?: boolean | 'array' | 'in';
};


