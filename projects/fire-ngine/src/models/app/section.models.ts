import { InjectionToken } from "@angular/core";

import { QueryFilter, IconConfig } from "..";


export interface SectionConfigParams {
  userRoles: string[];
}

export interface SectionConfig {
  /**
   * should be the same as what is used in the module config
   */
  sectionId: string; //

  /**
   * display name in nav links
   */
  displayName: string;

  /**
   * icon associated with section, used in navmenu and navbar
   */
  icon?: IconConfig;

  /**
   * db filters that are applied to all tabs
   */
  sectionFilters?: QueryFilter[];

  /**
   * entity ids in a particular order used in section tabs
   * should containt at least one <=> no tabs
   */
  tabs: string[]; // at least 1

  /**
   * entity ids used with firestore operations (copy/delete)
   */
  children?: string[];

  /**
  * entity ids in a particular order used in actions
  * map of action id to entity ids
  * first entity (0-index) is the default entity
  * remaining entities could be used in form steps
  */
  templates?: Record<string, string[]>;
};

export const SECTION_CONFIG = new InjectionToken<SectionConfig>('sectionConfig');
