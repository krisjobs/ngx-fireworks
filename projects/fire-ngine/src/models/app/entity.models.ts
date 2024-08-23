import {
  ChipConfig, DataViewMode, EntityAction, FormField, FormStep,
  GridCard, IconConfig, PanelData, QueryFilter, QuerySettings,
  SelectOption, TableColumn, TabProps, ViewSettings
} from "..";


export interface EntityConfigParams {
  userRoles: string[];

  entityId: string;

  parentId: string;
};

export interface EntityActionsConfig {
  collectionActions: EntityAction[];

  documentActions: EntityAction[];

  viewActions: EntityAction[];

  sortActions: EntityAction[];
};

export interface EntityDataViewConfig {
  dataViewModes: DataViewMode[];

  /**
   * definition of table columns
   */
  tableColumns: TableColumn[];

  /**
   * definition of grid cards
   */
  gridCard: GridCard;

  showTableQuickAction?: (params: Partial<EntityConfigParams>) => boolean;

  showCardQuickAction?: (params: Partial<EntityConfigParams>) => boolean;
};

export interface EntityFormConfig {
  initialFormIdx: number;

  /**
   * definition of form steps when creating/editing entities
   */
  formSteps: FormStep[];
};

export interface EntityToolbarConfig {
  /**
   * form fields used with query filters
   */
  queryFields: FormField[];

  toolbarChips?: (params: Partial<EntityConfigParams>) => ChipConfig[];

  showToolbarChips?: (params: Partial<EntityConfigParams>) => boolean;

  showToolbarPinnedAction?: (params: Partial<EntityConfigParams>) => boolean;
};

export interface EntityConfig {
  /**
   * should be the same as what is used in the module config
   */
  entityId: string;

  /**
   * display name in tabs, menus, templates
   */
  displayName: string;

  /**
   * icon associated with entity, used in tabs and actions
   */
  icon: IconConfig;

  /**
   * path to entity firestore collection
   */
  firestorePath?: (params: Partial<EntityConfigParams>) => string;

  /**
   * db filters that are applied to a tab/form step
   * encompasses getGlobalData + finalFilters
   */
  entityFilters?: (params: Partial<EntityConfigParams>) => QueryFilter[];

  /**
   * encompasses all action types
   */
  actions: EntityActionsConfig;

  /**
   * modal form-related config
   */
  form: EntityFormConfig;

  /**
   * table- and grid-related config
   */
  dataView: EntityDataViewConfig;

  /**
   * toolbar-related config
   */
  toolbar: EntityToolbarConfig;

  /**
   * default view settings
   */
  viewSettings: ViewSettings;

  /**
   * default query settings
   */
  querySettings: QuerySettings;

  /**
   * display config for tabs
   */
  tabProps?: TabProps;

  /**
   * display config for panels
   */
  panelProps?: Partial<PanelData>;

  /**
   * autoclear all query filters when reopening tab
   */
  autoClearFilters?: boolean;

  /**
   * needs refactoring, path to dynamic options list
   */
  optionsPath?: string;

  /**
   * substitute values with icons in a special category column
   * name/value pairs, name is icon name, value is table cell value
   */
  categories?: SelectOption[];
};
