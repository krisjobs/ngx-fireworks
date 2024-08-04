import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserHomeComponent } from './components/user-home/user-home.component';
import { UserLandingComponent } from '../../components/$pages/user-landing/user-landing.component';
import { UserLoginComponent } from '../../components/$pages/user-landing/user-login/user-login.component';
import { UserRegistrationComponent } from '../../components/$pages/user-landing/user-registration/user-registration.component';
import { UserSettingsComponent } from '../../components/$pages/user-account/user-settings/user-settings.component';
import { redirectUnauthorizedTo, AuthGuard, redirectLoggedInTo }
  from '@angular/fire/auth-guard';
import { UserAccountComponent } from '../../components/$pages/user-account/user-account.component';

// ==========================================

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['user', 'login']);

const redirectLoggedInToLanding = () => redirectLoggedInTo(['/']);

// ==========================================

const routes: Routes = [
  {
    path: '',
    component: UserHomeComponent,
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
