import { NgModule } from '@angular/core';
import { AuthGuard, customClaims, hasCustomClaim, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { map, pipe, tap } from 'rxjs';


// ==========================================

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['user', 'login']);

const isAdmin = () => hasCustomClaim('admin');
const adminOnly = () => hasCustomClaim('admin');

const hasCustomerAccess = () => pipe(
  customClaims,
  map(claims => !!claims.admin ||
    !!claims.manufacturer ||
    !!claims.supervisor ||
    !!claims.dealership ||
    !!claims.dealer ||
    !!claims.customer
  )
);

const hasDealerAccess = () => pipe(
  customClaims,
  map(claims => !!claims.admin ||
    !!claims.manufacturer ||
    !!claims.supervisor ||
    !!claims.dealership ||
    !!claims.dealer
  )
);

// ==========================================

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./core/core.module').then(m => m.CoreModule)
  },
  {
    path: 'user',
    loadChildren: () => import('./styleguide/modules/users/user.module').then(m => m.UserModule)
    // custom AuthGuard strategy inside
  },
  {
    path: "admin",
    loadChildren: () => import('./styleguide/modules/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard],
    data: {
      authGuardPipe: isAdmin
    }
  },
  {
    path: "yachts",
    loadChildren: () => import('./$yachts/yachts.module').then(m => m.BoatsModule),
    // canActivate: [LoginActivator]
    canActivate: [AuthGuard],
    data: {
      authGuardPipe: hasCustomerAccess
    }
  },
  {
    path: 'crm',
    loadChildren: () => import('./$crm/crm.module').then(m => m.CrmModule),
    canActivate: [AuthGuard],
    data: {
      authGuardPipe: hasDealerAccess
    }
  },
  {
    path: 'organizations',
    loadChildren: () => import('./$organizations/organizations.module').then(m => m.OrganizationsModule),
    canActivate: [AuthGuard],
    data: {
      authGuardPipe: hasDealerAccess
    }
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./$dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard],
    data: {
      authGuardPipe: hasDealerAccess
    }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
