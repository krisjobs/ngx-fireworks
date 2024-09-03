import { InjectionToken } from "@angular/core";
import { ParamMap } from "@angular/router";

import {
  ContextMap, EmulatorPorts, EntityConfig,
  ModuleConfig, SectionConfig
} from "..";


// export interface ConfigParams<T extends Entity = Entity> {
//   data: any; // custom data for some operations
//   flag: boolean;
//   context: UrlEntities;
//   url: UrlParams;
//   entityConfig: EntityConfig;
//   sectionConfig: SectionConfig;
//   viewSettings: ViewSettings;
//   querySettings: QuerySettings;
//   entity: T;
//   entities: any; // used to be (T | null | undefined)[], but the elements are of different type
//   roles: UserRole;
// }

export interface ConfigParams {
  userRoles: string[];
  paramMap: ParamMap;
  queryParamMap: ParamMap;
  contextMap: ContextMap;
}

export interface AppConfig {
  /**
   * ports used with firebase emulator
   */
  ports: EmulatorPorts;

  /**
   * current version of the app
   */
  version: string;

  /**
   * module definitions
   */
  modules: ModuleConfig[];

  /**
   * section definitions
   */
  sections: Record<string, SectionConfig>;

  /**
   * entity definitions
   */
  entities: Record<string, EntityConfig>;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('AppConfig');
