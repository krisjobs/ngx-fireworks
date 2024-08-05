import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../../firebase/services/auth.service';


@Component({
  selector: 'fng-user-account',
  standalone: true,
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.scss']
})
export class UserAccountComponent implements OnInit {

  public user$$ = this.authService.currentUser$$;

  public userForm!: FormGroup;

  public get usernameControl() {
    return this.userForm.get('username') as FormControl;
  }

  public get emailControl() {
    return this.userForm.get('email') as FormControl;
  }

  public get avatarControl() {
    return this.userForm.get('avatarUrl') as FormControl;
  }

  public get oldPassControl() {
    return this.userForm.get('oldPassword') as FormControl;
  }

  public get newPassControl() {
    return this.userForm.get('newPassword') as FormControl;
  }

  public get verificationSender() {
    return environment.user.verificationSender;
  }

  panelOpenState = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
  ) {
    this.initUserForm();
  }

  ngOnInit(): void {
  }

  private initUserForm() {
    this.userForm = this.formBuilder.group({
      username: this.formBuilder.control(
        this.authService.currentUser?.displayName, [
        // Validators.required
      ]),
      avatarUrl: this.formBuilder.control(this.authService.currentUser?.photoURL, [
        // Validators.required
      ]),
      email: this.formBuilder.control(this.authService.currentUser?.email, [
        Validators.required,
        Validators.email
      ]),
      oldPassword: this.formBuilder.control(undefined, [
        Validators.required,
        Validators.minLength(6)
      ]),
      newPassword: this.formBuilder.control(undefined, [
        Validators.required,
        Validators.minLength(6)
      ]),
    });
  }

  public clearEmail() {
    this.emailControl.setValue('');
  }

  public clearOldPass() {
    this.oldPassControl.setValue('');
  }

  public clearNewPass() {
    this.newPassControl.setValue('');
  }

  public resetUsername() {
    this.usernameControl.setValue(this.authService.currentUser?.displayName);
  }

  public resetAvatar() {
    this.avatarControl.setValue(this.authService.currentUser?.photoURL);
  }

  public updateUsername(displayName: string) {
    this.authService.updateProfile({ displayName });
  }

  public updatePassword(oldPass: string, newPass: string) {
    this.authService.updatePassword(oldPass, newPass);
  }

  public updateAvatar(photoURL: string) {
    this.authService.updateProfile({ photoURL });
  }

  public updateEmail(email: string) {
    this.authService.updateEmail(email);
  }
}
