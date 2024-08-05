import { InjectionToken } from "@angular/core";
import { QueryParamsHandling } from "@angular/router";
import { Observable } from "rxjs";

import { Entity } from "../../common/models";


export interface AppConfigParams {
  userRoles: string[];
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

export interface HeadingSegment {
  displayName: string;
  redirectUrl: string;
}

export interface NavigationLink {
  title: string;
  targetUrl: string;
  icon?: string;
  hidden?: (params: Partial<AppConfigParams>) => boolean;
  svgIcon?: boolean;
  outlined?: boolean;
  disabled?: boolean;
  classes?: string[];
  mergeQueryParams?: QueryParamsHandling;
};

export interface RouterMapping {
  sidenavLinks: NavigationLink[];
  url2heading: (url: string) => string;
};

// ===================== MAIN =====================

export interface AppConfig {
  navLinks: NavigationLink[];
  toolbarLinks?: NavigationLink[];
  appTitle: string;
  userLink?: string;
  googleLoginRedirect?: boolean;
  showHeaderLinks?: boolean;
  headerLinkBreakpoints?: number[];
  headerLinkStrategy?: boolean[];
  headerTitleStrategy: (params: Partial<AppConfigParams>) => HeadingSegment[];
  footerTitleStrategy: (params: Partial<AppConfigParams>) => string;
  styles?: any;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('appConfig');
