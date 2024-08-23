import { InjectionToken } from "@angular/core";

import { EmulatorPorts, EntityConfig, ModuleConfig, SectionConfig } from "..";


export interface AppConfigParams {
  userRoles: string[];
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
