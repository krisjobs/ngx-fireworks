import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';


import { routes } from './app.routes';
import { environment } from '../../environments/environment';
// import { ENV_CONFIG } from '../../../fire-ngine/src/models';


export const ngConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    // {
    //   provide: ENV_CONFIG,
    //   useValue: environment,
    // },
    // {
    //   provide: APP_CONFIG,
    //   useValue: appConfig
    // },
    // importProvidersFrom(FirebaseModule)
  ]
};
