import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import { ENV_CONFIG, LIB_CONFIG } from '../../../fire-ngine/src/models';
import { FirebaseModule } from '../../../fire-ngine/src/modules';

import { routes } from './app.routes';
import { libConfig } from './core/configs/lib.config';
import { environment } from '../../environments/environment';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    {
      provide: ENV_CONFIG,
      useValue: environment,
    },
    {
      provide: LIB_CONFIG,
      useValue: libConfig
    },
    importProvidersFrom(FirebaseModule)
  ]
};
