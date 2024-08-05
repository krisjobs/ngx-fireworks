import { Routes } from '@angular/router';
import {
  redirectUnauthorizedTo, AuthGuard, redirectLoggedInTo
} from '@angular/fire/auth-guard';

import { UserLandingComponent } from '../../components/$pages/user-landing/user-landing.component';
import { UserLoginComponent } from '../../components/$pages/user-landing/user-login/user-login.component';
import { UserRegistrationComponent } from '../../components/$pages/user-landing/user-registration/user-registration.component';
import { UserSettingsComponent } from '../../components/$pages/user-account/user-settings/user-settings.component';
import { UserAccountComponent } from '../../components/$pages/user-account/user-account.component';
import { ModuleComponent } from '../../components/templates/module/module.component';

// ==========================================

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['user', 'login']);

const redirectLoggedInToLanding = () => redirectLoggedInTo(['/']);

// ==========================================

export const USER_ROUTES: Routes = [
  {
    path: '',
    component: ModuleComponent,
    redirectTo: 'account',
    children: [
      {
        path: 'login',
        component: UserLoginComponent,
        canActivate: [AuthGuard],
        data: {
          authGuardPipe: redirectLoggedInToLanding
        }
      },
      {
        path: 'registration',
        component: UserRegistrationComponent,
        canActivate: [AuthGuard],
        data: {
          authGuardPipe: redirectLoggedInToLanding
        }
      },
      {
        path: 'landing',
        component: UserLandingComponent,
        canActivate: [AuthGuard],
        data: {
          authGuardPipe: redirectLoggedInToLanding
        }
      },
      {
        path: 'account',
        component: UserAccountComponent,
        canActivate: [AuthGuard],
        data: {
          authGuardPipe: redirectUnauthorizedToLogin
        }
      },
      {
        path: 'settings',
        component: UserSettingsComponent,
        canActivate: [AuthGuard],
        data: {
          authGuardPipe: redirectUnauthorizedToLogin
        }
      }
    ]
  },
];
