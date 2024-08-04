import { Observable } from "rxjs";

// ===================== MODELS =====================

import {
  DashboardLayout, FormField, FormStep, GridCard,
  ListItem, NavigationLink, TableColumn, TabProperties,
  EntityAction, EntityFilter, EntitySettings,
  QuerySettings, ViewSettings,
} from "..";
import { Entity, EntityAttributes, User, UserRoles } from "functions/src/styleguide/models";

// ===================== DEFINITIONS =====================

export type OverviewDisplayType = 'grid' | 'table' | 'dashboard' | 'freeform';
export type SortType = 'most-recent' | 'most-relevant' | 'custom-order' | 'active-first' | 'default-first';
export type SortDirection = 'desc' | 'asc';
export type CrudOperation = 'create' | 'update' | 'delete';

export interface HeadingSegment {
  displayName: string;
  redirectUrl: string;
}

export interface CrudDialogData {
  entity: Partial<Entity>;
  context: UrlEntities;
  url: UrlParams;
  /**
   * used with templates to preselect parent
   * steps where parent.id can be used to preselect the entity
   */
  parentContextIdx?: number;

  /**
   * used with templates to send data to form
   * specifies idx of template collection which to use as input
   */
  formContextIdx?: number;

  steps: FormStep[];
  operation: CrudOperation;
  newId?: string;
  title: string;
  targetPath?: string;

  /**
   * changes generateRawEntity to set
   * attributes.type to sectionConfig.key and
   * attributes.class to entityConfig.descriptor
   */
  sectionAsType?: boolean;

  markedForDelete?: boolean;

  /**
   * Used to show templates tables independent from entity settings
   */
  hideTemplates?: boolean;

  /**
   * Used to show templates tables independent from url
   */
  showTemplates?: boolean;

  selectedFormIdx?: number;
  selectedStepIdx?: number;
  templatesConfig?: TemplatesConfigData;
  subcollections?: string[];
  saveButtonText?: string; // override default save button text
  copySubcollectionAttributes?: <T extends Entity>(params: Partial<ConfigParams<T>>) => EntityAttributes;

  /**
   * override default firestore path generation strategy
   *
   * especially useful for files
   */
  pathOverride?: string;

  config?: [SectionConfig, number];
  onRequest?: (data: any) => any;
  onResponse?: (data?: any) => void;
  customRequest$?: (data: any, dialogData: CrudDialogData) => Observable<any>
};

export interface ConfigSheetData {
  entity: Entity;
  items: ListItem[][];
  demoMode?: boolean;
  withButton?: boolean;
  buttonText?: string;
  closeOnSave?: boolean;
  buttonDisabled?: (entity: any) => boolean,
};

export interface TemplatesConfigData {
  templateCollections?: string[];
  templateStageNames?: string[];
  templateStepLabels?: string[];
  templateStepIcons?: string[];
  templateStepColors?: string[];
  entitiesDisplay?: ((entity: any) => string)[];
  preselectStrategy?: (user: User, templates: Entity[], related?: any, entities?: any) => (Entity | undefined)[];
  entityAssembly?: (entities: any, initial: any, current: any) => Entity;
  entitiesCancel?: (oldEntities: any, newEntities: any) => (Entity | null)[];
  viewFilters?: <T extends Entity>(params: Partial<ConfigParams<T>>) => { [filterId: string]: EntityFilter }[];
}

export interface InvokeActionParams<T extends Entity> {
  action: EntityAction;
  url: UrlParams;
  context?: UrlEntities;
  entity?: T;
  data?: string;
  forTemplates: boolean;
  dialogSettings?: Partial<CrudDialogData>;
}

export interface AppConfig {
  navLinks: NavigationLink[];
  toolbarLinks?: NavigationLink[];
  appTitle: string;
  userLink?: string;
  googleLoginRedirect?: boolean;
  showHeaderLinks?: boolean;
  headerLinkBreakpoints?: number[];
  headerLinkStrategy?: boolean[];
  headerTitleStrategy: <T extends Entity>(params: Partial<ConfigParams<T>>) => HeadingSegment[];
  footerTitleStrategy: <T extends Entity>(params: Partial<ConfigParams<T>>) => string;
  styles?: any;
}

export interface ModuleConfig {
  urlSegment: string;
  navLinks: NavigationLink[][];
  homeLayout?: DashboardLayout;
  showNavLinksHome?: boolean;
}

export interface SectionConfig {
  sectionFilters?: EntityFilter[]; // db filters
  sectionKey: string; // use in local storage
  /**
   * holder of a single EntityConfig
   */
  tabs: EntityConfig[]; // at least 1

  /**
   * similar to dialogForm but for side stages
   */
  templates?: EntityConfig[];

  /**
   * similar to templates but for dialog form
   */
  dialogForm?: [SectionConfig, number];

  related?: RelatedConfigsMap;
  children?: string[];
};

// number is idx of entity config = tab
export type RelatedConfigsMap = {
  [descriptor: string]: RelatedConfig;
};

export interface RelatedConfig {
  config: SectionConfig;
  entityIdx: number;
  firestorePathOverride?: <T extends Entity>(params: Partial<ConfigParams<T>>) => string;
};

export interface EntityConfig {
  descriptor: string; // code id
  displayName: string; // use in html
  firestorePath: string; // use in db - default collection

  icon: string; // use in html

  /**
   * bypasses target path formed from url in entities resolver
   * example: items vs characters/{charId}/items
   */
  bypassTargetPath?: boolean;

  /**
   * in entities resolver -> get global data even if you are not an admin
   */
  getGlobalData?: boolean;

  optionsPath?: any;

  tabProps?: TabProperties;
  tabFilters?: EntityFilter[];

  /**
   * used in entities resolver to override final query settings view filter
   * very useful for url-based queries
   */
  finalFilters?: <T extends Entity>(params: Partial<ConfigParams<T>>) => { [filterId: string]: EntityFilter };

  /**
   * autoclear all query filters when opening overview component
   */
  autoClearFilters?: boolean;

  entitySettings: EntitySettings;

  configSheet?: Partial<ConfigSheetData>;

  formSteps: FormStep[];
  tableColumns: TableColumn[];
  gridCard: GridCard;

  viewSettingsStrategy?: <T extends Entity>(params: Partial<ConfigParams<T>>) => Partial<ViewSettings>;

  collectionActions: EntityAction[];
  documentActions: EntityAction[];

  viewActions: EntityAction[];
  filterFields: FormField[];
  sortActions: EntityAction[];

  viewSettings: ViewSettings; // default settings
  querySettings: QuerySettings; // default settings

  templateSettings?: QuerySettings[]; // default settings
  contextSettings?: ViewSettings[]; // default settings
}

export interface UrlParams {
  rawUrl: string;
  moduleName: string;
  rootType?: string;
  rootId?: string;
  nestedType?: string;
  nestedId?: string;
  queryType?: string;
  queryId?: string;
}

export interface UrlEntitiesContext {
  root?: Observable<Entity>;
  nested?: Observable<Entity>;
  query?: Observable<Entity>;
}

export interface UrlEntities {
  root: Entity | null;
  nested: Entity | null;
  query: Entity | null;
}

export interface ConfigParams<T extends Entity = Entity> {
  data: any; // custom data for some operations
  flag: boolean;
  context: UrlEntities;
  url: UrlParams;
  entityConfig: EntityConfig;
  sectionConfig: SectionConfig;
  viewSettings: ViewSettings;
  querySettings: QuerySettings;
  entity: T;
  entities: any; // used to be (T | null | undefined)[], but the elements are of different type
  roles: UserRoles;
}
