import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../firebase/services/auth.service';
import { AuthFormChoices } from 'src/app/styleguide';

interface UserFormChoices {
  username?: string;
  imageUrl?: string;
  acceptTerms: boolean;
  verifiedEmail: boolean;
  isAdmin: boolean;
}

@Component({
  selector: 'lib-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss']
})
export class UserRegistrationComponent implements OnInit {

  @HostListener('window:keyup.Enter', ['$event'])
  onPressEnter($event: KeyboardEvent): void {
    $event.preventDefault();
    $event.stopPropagation();

    if (this.regForm.valid) {
      this.registerUser();
    }
  }

  public regForm!: FormGroup;

  public get emailControl() {
    return this.regForm.get('email') as FormControl;
  }

  public get passwordControl() {
    return this.regForm.get('password') as FormControl;
  }

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
  ) {
    this.initForms();
  }

  ngOnInit() {

  }

  private initForms() {
    this.regForm = this.formBuilder.group({
      email: this.formBuilder.control(undefined, [
        Validators.required,
        Validators.email
      ]),
      password: this.formBuilder.control(undefined, [
        Validators.required,
        Validators.minLength(6)
      ]),
      acceptTerms: this.formBuilder.control(false, [
        Validators.requiredTrue
      ]),
    });
  }

  public registerUser() {
    const {
      email,
      password
    } = this.regForm.value as AuthFormChoices;

    // this.usernameControl.setValue(email.split('@')[0])

    this.authService.signUp(
      email,
      password
    );
  }
}
