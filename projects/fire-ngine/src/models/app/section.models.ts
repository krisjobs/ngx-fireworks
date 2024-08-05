import { InjectionToken } from "@angular/core";

import { Entity, UserRole } from "../../common/models";
import {
  EntityAction, EntityFilter, EntitySettings, FormField,
  FormStep, GridCard, PanelData, QuerySettings, TableColumn,
  TabProperties, UrlEntities, UrlParams, ViewSettings
} from "..";

// number is idx of entity config = tab
// export type RelatedConfigsMap = {
//   [descriptor: string]: RelatedConfig;
// };

// export interface RelatedConfig {
//   config: SectionConfig;
//   entityIdx: number;
//   firestorePathOverride?: <T extends Entity>(params: Partial<ConfigParams<T>>) => string;
// };

// ===================== MAIN =====================

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
  roles: UserRole;
}

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
  finalFilters?: <T extends Entity>(params: Partial<ConfigParams<T>>) => Record<string, EntityFilter>;

  /**
   * autoclear all query filters when opening overview component
   */
  autoClearFilters?: boolean;

  entitySettings: EntitySettings;

  configSheet?: Partial<PanelData>;

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

  // related?: RelatedConfigsMap;
  children?: string[];
};

export const SECTION_CONFIG = new InjectionToken<SectionConfig>('sectionConfig');
