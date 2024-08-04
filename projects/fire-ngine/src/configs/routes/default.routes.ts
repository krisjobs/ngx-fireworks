import { Routes } from '@angular/router';


export const routes: Routes = [
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
    loadChildren: () => import('./$admin/admin.routes')
      .then(m => m.ADMIN_ROUTES),
  },
  {
    path: '**',
    loadComponent: () => import('./core/components/page-not-found/page-not-found.component')
      .then(m => m.PageNotFoundComponent),
  }
];

