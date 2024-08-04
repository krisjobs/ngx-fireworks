import { Component, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/styleguide/services/notification.service';
import { UserService } from 'src/app/styleguide/modules/users/services/user.service';
import { AuthFormChoices } from 'src/app/styleguide';

@Component({
  selector: 'lib-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss']
})
export class UserLoginComponent implements OnInit {

  @HostListener('window:keyup.Enter', ['$event'])
  onPressEnter($event: KeyboardEvent): void {
    $event.preventDefault();
    $event.stopPropagation();

    if (this.loginForm.valid) {
      this.loginUser();
    }
  }

  public get hasHint() {
    return true;
  }

  public loginForm!: FormGroup;

  public get loginEmailControl() {
    return this.loginForm.get('email') as FormControl;
  }

  public get loginPasswordControl() {
    return this.loginForm.get('password') as FormControl;
  }

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private notificationService: NotificationService,
  ) {
    this.initLoginForm();
  }

  ngOnInit() {
  }

  private initLoginForm() {
    this.loginForm = this.formBuilder.group({
      email: this.formBuilder.control(undefined, [
        Validators.required,
        Validators.email
      ]),
      password: this.formBuilder.control(undefined, [
        Validators.required,
        Validators.minLength(6)
      ]),
    });
  }

  public loginUser() {
    const {
      email,
      password
    } = this.loginForm.value as AuthFormChoices;

    this.userService.logIn(email, password);
  }

  public emailLink() {
    const {
      email,
    } = this.loginForm.value as AuthFormChoices;

    this.userService.emailLogIn(email);
  }

  public resetPass() {
    const {
      email,
    } = this.loginForm.value as AuthFormChoices;

    this.userService.emailPassReset(email);
  }
}


