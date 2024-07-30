import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  provideFirebaseApp,
  initializeApp,
  getApp
} from '@angular/fire/app';

import {
  provideAuth,
  getAuth,
  connectAuthEmulator,
} from '@angular/fire/auth';

import {
  provideFirestore,
  connectFirestoreEmulator,
  initializeFirestore
} from '@angular/fire/firestore';

import {
  provideStorage,
  getStorage,
  connectStorageEmulator,
} from '@angular/fire/storage';

import {
  getFunctions,
  provideFunctions,
  connectFunctionsEmulator
} from '@angular/fire/functions';

import { environment } from 'src/environments/environment';
import { AuthService } from './services/auth.service';
import { FirestoreService } from './services/firestore.service';
import { FunctionsService } from './services/functions.service';
import { StorageService } from './services/storage.service';
import { FirebaseService } from './services/firebase.service';

import { ports } from 'src/app/shared/utility/firebase-ports';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    provideFirestore(() => {
      const firestore = initializeFirestore(getApp(), {
        experimentalForceLongPolling: !environment.production,
      });

      if (environment.useEmulators) {
        connectFirestoreEmulator(firestore, 'localhost', ports.firestore);
      }

      // ? maybe this will solve caching problems
      // enableIndexedDbPersistence(firestore, {
      //   forceOwnership: true
      // });

      return firestore;
    }),

    provideAuth(() => {

      const auth = getAuth();

      // ? use this to clear data after closing tab
      // const auth = initializeAuth(getApp(), {
      //   persistence: browserSessionPersistence,
      //   popupRedirectResolver: browserPopupRedirectResolver
      // });

      if (environment.useEmulators) {
        connectAuthEmulator(auth, `http://localhost:${ports.auth}`);
      }

      return auth;
    }),

    provideFunctions(() => {
      let functions;

      if (environment.useEmulators) {
        functions = getFunctions(undefined, 'europe-west3');
        connectFunctionsEmulator(functions, 'localhost', ports.functions);
      } else {
        functions = getFunctions(undefined, 'europe-west3');
      }

      return functions;
    }),

    provideStorage(() => {
      // if no bucket url provided, the default is used
      const storage = getStorage();

      if (environment.useEmulators) {
        connectStorageEmulator(storage, 'localhost', ports.storage);
      }

      return storage;
    }
    ),
  ],
  exports: [

  ],
  providers: [
    AuthService,
    FirestoreService,
    FunctionsService,
    StorageService,
    FirebaseService,
  ]
})
export class FirebaseModule { }
