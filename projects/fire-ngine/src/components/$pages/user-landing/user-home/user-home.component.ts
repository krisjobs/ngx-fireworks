import { Component, Inject, OnInit } from '@angular/core';
import { APP_CONFIG } from 'src/app/styleguide/services/app.providers';
import { AuthService } from '../../../firebase/services/auth.service';
import { AppConfig } from 'src/app/styleguide';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'lib-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss']
})
export class UserHomeComponent implements OnInit {

  public signedIn$$ = this.userService.isLoggedIn$$;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    @Inject(APP_CONFIG) private config: AppConfig,
  ) {
    if (!!this.config.googleLoginRedirect && !this.authService.currentUser) {
      this.googleLogIn();
    }
  }

  ngOnInit(): void {
  }

  public googleLogIn() {
    this.userService.googleLogIn();
  }

  public logOut() {
    this.userService.logOut();
  }
}
