import { Routes } from '@angular/router';
import { AuthGuard, hasCustomClaim, } from '@angular/fire/auth-guard';

import { UserRole } from '../../common/models';


export const DEFAULT_ROUTES: Routes = [
  // {
  //   path: '',
  //   pathMatch: 'full',
  //   loadChildren: () => import('./$home/home.routes')
  //     .then(m => m.HOME_ROUTES)
  // },
  {
    path: 'user',
    loadChildren: () => import('./user.routes')
      .then(m => m.USER_ROUTES),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin.routes')
      .then(m => m.ADMIN_ROUTES),
    canActivate: [
      AuthGuard
    ],
    data: {
      authGuardPipe: hasCustomClaim(UserRole.ADMIN)
    }
  },
  {
    path: '**',
    loadComponent: () => import('../../components/$pages/not-found/not-found.component')
      .then(m => m.NotFoundComponent),
  }
];

