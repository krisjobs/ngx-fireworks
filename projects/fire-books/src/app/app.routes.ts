import { Routes } from '@angular/router';
import { TesComponent } from './tes/tes.component';

export const routes: Routes = [
  {
    path: 'wow/:testId',
    component: TesComponent,
    title: 'Home',
    data: {
      test: 'wow123'
    },
    resolve: {
      test2: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve('wow456');
          }, 1000);
        });
      }
    }
  }
];
