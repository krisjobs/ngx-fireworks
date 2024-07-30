import { InjectionToken } from '@angular/core';

export interface LibConfig {
  apiUrl: string;
  featureFlag: boolean;
  // Add other configuration properties as needed
}

export const LIB_CONFIG = new InjectionToken<LibConfig>('LibConfig');
