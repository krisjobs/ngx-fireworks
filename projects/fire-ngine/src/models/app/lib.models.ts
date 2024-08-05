import { InjectionToken } from '@angular/core';

import { UserRole } from '../../common/models';
import { DashboardLayout, EmulatorPorts } from '..';


export interface ModuleConfigParams {
  userRoles: UserRole[];
}

export interface ModuleConfig {
  /**
   * relative url path from root
   */
  routerLink: string[];

  /**
   * unique url path segment
   */
  urlSegment: string;

  /**
   * display name in navmenu and header
   */
  displayName: string;

  /**
   * module nav link hidden from header
   */
  hiddenFromHeader?: (params: Partial<ModuleConfigParams>) => boolean;

  /**
   * module nav link hidden from sidenav
   */
  hiddenFromSidenav?: (params: Partial<ModuleConfigParams>) => boolean;

  /**
   * layout for dashboard view
   */
  homeLayout?: DashboardLayout;

  /**
   * show home nav link in sidenav
   */
  showNavLinksHome?: boolean;
}

export interface LibConfig {
  ports: EmulatorPorts;
  version: string;
  modules: ModuleConfig[];
}

export const LIB_CONFIG = new InjectionToken<LibConfig>('LibConfig');
