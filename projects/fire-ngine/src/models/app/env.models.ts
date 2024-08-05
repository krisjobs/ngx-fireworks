import { InjectionToken } from "@angular/core";


export type Region = 'eu' | 'ae';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

export interface EnvConfig {
  production: boolean;
  useEmulators: boolean;
  appRegion: Region;
  dbRegion: string; // Firestore + Storage
  beRegion: string; // Functions
  firebase: FirebaseConfig;
}

export const ENV_CONFIG = new InjectionToken<EnvConfig>('EnvConfig');
