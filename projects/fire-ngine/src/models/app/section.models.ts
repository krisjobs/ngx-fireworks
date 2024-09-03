import { InjectionToken } from "@angular/core";

import { QueryFilter, IconConfig, ConfigParams } from "..";


export interface SectionConfigParams extends ConfigParams {
  test: string;
}

export interface SectionConfig {
  /**
   * should be the same as what is used in the module config
   */
  sectionId: string; //

  /**
   * unique url path segment
   */
  urlSegment: string;

  /**
   * display name in nav links
   */
  displayName: string;

  /**
   * icon associated with section, used in navmenu and navbar
   */
  icon?: IconConfig;

  /**
   * nesting of sections, no restrictions on depth
   */
  subsections: SectionConfig[];

  /**
   * db filters that are applied to all tabs
   */
  sectionFilters?: QueryFilter[];

  /**
   * entity ids in a particular order used in section tabs
   * should containt at least one <=> no tabs
   */
  tabs?: string[]; // at least 1

  /**
   * entity ids used with firestore operations (copy/delete)
   */
  children?: string[];
};
