import { InjectionToken } from '@angular/core';
import { EmulatorPorts } from '../firebase/firebase.models';

export interface LibConfig {
  ports: EmulatorPorts;
}

export const LIB_CONFIG = new InjectionToken<LibConfig>('LibConfig');
