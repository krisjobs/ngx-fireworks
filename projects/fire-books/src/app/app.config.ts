import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ENV_CONFIG } from '../../../fire-ngine/src/models/app/env.models';
import { FirebaseModule } from '../../../fire-ngine/src/modules';
import { LIB_CONFIG } from '../../../fire-ngine/src/models';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    {
      provide: ENV_CONFIG,
      useValue: {
        firebase: {
          projectId: "fire-b00ks",
          appId: "1:744692719903:web:7ece87bdc3f898e84d102a",
          storageBucket: "fire-b00ks.appspot.com",
          apiKey: "AIzaSyAH0g5KUdHGRRX0vjMT8n2LKIVy-OIAo7c",
          authDomain: "fire-b00ks.firebaseapp.com",
          messagingSenderId: "744692719903",
          measurementId: "G-RV4WWH0G7H"
        }
      },
    },
    {
      provide: LIB_CONFIG,
      useValue: {
        ports: {
          firestore: 8080,
          functions: 5001,
          hosting: 5000,
          pubsub: 8085,
          storage: 9199,
          ui: 4000
        }
      }
    },
    importProvidersFrom(FirebaseModule)
  ]
};
