import { Injector, NgModule, } from '@angular/core';
import { CommonModule } from '@angular/common';

import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { connectFirestoreEmulator, initializeFirestore, provideFirestore } from '@angular/fire/firestore';
import { connectStorageEmulator, getStorage, provideStorage } from '@angular/fire/storage';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';

// import { initializeAppCheck, ReCaptchaEnterpriseProvider, provideAppCheck } from '@angular/fire/app-check';
// import { getMessaging, provideMessaging } from '@angular/fire/messaging';
// import { getPerformance, providePerformance } from '@angular/fire/performance';
// import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
// import { getRemoteConfig, provideRemoteConfig } from '@angular/fire/remote-config';

import { LIB_CONFIG, ENV_CONFIG } from '../models';
import { AuthService } from '../services/firebase/auth.service';
import { FirestoreService } from '../services/firebase/firestore.service';
import { FunctionsService } from '../services/firebase/functions.service';
import { StorageService } from '../services/firebase/storage.service';
import { FirebaseService } from '../services/firebase/firebase.service';


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    provideFirebaseApp((injector: Injector) => {
      const envConfig = injector.get(ENV_CONFIG);
      return initializeApp(envConfig.firebase);
    }),
    provideAuth((injector: Injector) => {
      const envConfig = injector.get(ENV_CONFIG);
      const libConfig = injector.get(LIB_CONFIG);

      const auth = getAuth();

      // ? use this to clear data after closing tab
      // const auth = initializeAuth(getApp(), {
      //   persistence: browserSessionPersistence,
      //   popupRedirectResolver: browserPopupRedirectResolver
      // });

      if (envConfig.useEmulators) {
        connectAuthEmulator(auth, `http://localhost:${libConfig.ports.auth}`);
      }

      auth.setPersistence({ type: envConfig.sessionPersistence });

      return auth;
    }),
    provideFirestore((injector: Injector) => {
      const envConfig = injector.get(ENV_CONFIG);
      const libConfig = injector.get(LIB_CONFIG);

      const firestore = initializeFirestore(getApp(), {
        // experimentalForceLongPolling: !environment.production,
      });

      if (envConfig.useEmulators) {
        connectFirestoreEmulator(firestore, 'localhost', libConfig.ports.firestore);
      }

      // enableIndexedDbPersistence(firestore, {
      //   forceOwnership: true
      // });

      return firestore;
    }),
    provideStorage((injector: Injector) => {
      const envConfig = injector.get(ENV_CONFIG);
      const libConfig = injector.get(LIB_CONFIG);

      // if no bucket url provided, the default is used
      const storage = getStorage();

      if (envConfig.useEmulators) {
        connectStorageEmulator(storage, 'localhost', libConfig.ports.storage);
      }

      return storage;
    }),
    provideFunctions((injector: Injector) => {
      const envConfig = injector.get(ENV_CONFIG);
      const libConfig = injector.get(LIB_CONFIG);

      const functions = getFunctions(getApp(), envConfig.beRegion);

      if (envConfig.useEmulators) {
        connectFunctionsEmulator(functions, 'localhost', libConfig.ports.functions);
      }

      return functions;
    }),

    // provideMessaging(() => getMessaging())),
    // provideAnalytics(() => getAnalytics())),
    // providePerformance(() => getPerformance())),
    // provideRemoteConfig(() => getRemoteConfig())),
    // ScreenTrackingService,
    // UserTrackingService,
    // provideAppCheck(() => {
    //   // TODO get a reCAPTCHA Enterprise here https://console.cloud.google.com/security/recaptcha?project=_
    //   const provider = new ReCaptchaEnterpriseProvider(/* reCAPTCHA Enterprise site key */);
    //   return initializeAppCheck(undefined, { provider, isTokenAutoRefreshEnabled: true });
    // })),

    FirebaseService,
    AuthService,
    FirestoreService,
    StorageService,
    FunctionsService,
  ]
})
export class FirebaseModule {

}
