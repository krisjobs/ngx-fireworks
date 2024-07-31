import { EnvConfig } from "../../fire-ngine/src/models/app/env.models";

export const environment: EnvConfig = {
  production: false,
  useEmulators: true,
  appRegion: 'eu',
  dbRegion: 'eur3',
  beRegion: 'europe-west3',
  firebase: {
    projectId: "fire-b00ks",
    appId: "1:744692719903:web:7ece87bdc3f898e84d102a",
    storageBucket: "fire-b00ks.appspot.com",
    apiKey: "AIzaSyAH0g5KUdHGRRX0vjMT8n2LKIVy-OIAo7c",
    authDomain: "fire-b00ks.firebaseapp.com",
    messagingSenderId: "744692719903",
    measurementId: "G-RV4WWH0G7H"
  },
};
