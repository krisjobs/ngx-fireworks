import { Component, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/styleguide/services/notification.service';
import { UserService } from 'src/app/styleguide/modules/users/services/user.service';
import { AuthFormChoices } from 'src/app/styleguide';
import { AuthService } from '../../../firebase/services/auth.service';


@Component({
  selector: 'fng-user-landing',
  standalone: true,
  templateUrl: './user-landing.component.html',
  styleUrls: ['./user-landing.component.scss']
})
export class UserLandingComponent implements OnInit {

  @HostListener('window:keyup.Enter', ['$event'])
  onPressEnter($event: KeyboardEvent): void {
    $event.preventDefault();
    $event.stopPropagation();

    if (this.landingForm.valid) {
      this.loginUser();
    }
  }

  public landingForm!: FormGroup;

  public get landingEmailControl() {
    return this.landingForm.get('email') as FormControl;
  }

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private notificationService: NotificationService,
  ) {
    this.initLandingForm();
  }

  ngOnInit() {
  }

  private initLandingForm() {
    this.landingForm = this.formBuilder.group({
      email: this.formBuilder.control(
        // Get the email if available. This should be available if the user completes
        // the flow on the same device where they started it.
        window.localStorage.getItem('user.auth.email'),
        [
          Validators.required,
          Validators.email
        ]),
    });
  }

  public loginUser() {
    const {
      email,
    } = this.landingForm.value as AuthFormChoices;

    const url = window.location.href;

    if (this.authService.isSignInWithEmailLink(url)) {
      // Additional state parameters can also be passed via URL.
      // This can be used to continue the user's intended action before triggering
      // the sign-in operation.

      this.authService.signInWithEmailLink(email, url)
    } else {
      this.notificationService.error(`You shall not pass.`)
    }

  }
}
