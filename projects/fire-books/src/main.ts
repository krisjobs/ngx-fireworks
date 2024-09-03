import { bootstrapApplication } from '@angular/platform-browser';
import { ngConfig } from './app/ng.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, ngConfig)
  .catch((err) => console.error(err));
