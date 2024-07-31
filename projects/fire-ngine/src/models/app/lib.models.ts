import { InjectionToken } from '@angular/core';
import { EmulatorPorts } from '../firebase/firebase.models';
import { UserRole } from "../../common/models";

export interface ModuleConfigParams {
  userRoles: UserRole[];
}

export interface ModuleConfig {
  routerLink: string[];
  displayName: string;
  hiddenFromHeader?: (params: Partial<ModuleConfigParams>) => boolean;
  hiddenFromSidenav?: (params: Partial<ModuleConfigParams>) => boolean;
}

export interface LibConfig {
  ports: EmulatorPorts;
  version: string;
  modules: ModuleConfig[];
}

export const LIB_CONFIG = new InjectionToken<LibConfig>('LibConfig');
