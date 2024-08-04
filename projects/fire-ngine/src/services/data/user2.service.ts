import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { NotificationService } from 'src/app/styleguide/services/notification.service';
import { AuthService } from '../../firebase/services/auth.service';
import { FirestoreService } from '../../firebase/services/firestore.service';
import { User } from 'functions/src/styleguide/models';


@Injectable()
export class UserService {

  public get displayName(): string | null {
    return this.authService.currentUser && this.authService.currentUser.displayName;
  }

  public currentUser$$ = this.authService.currentUser$$.pipe(
    // tap(console.warn),
    switchMap(user => !!user ? this.firestoreService.getDoc$<User>('users', user.uid) : of(null))
  );

  public isLoggedIn$$: Observable<boolean> = this.authService.currentUser$$.pipe(
    map(user => !!user)
  );

  public isLoggedOut$$: Observable<boolean> = this.isLoggedIn$$.pipe(
    map((loggedIn: boolean) => !loggedIn)
  );

  public avatarUrl$$ = this.authService.currentUser$$.pipe(
    map((user) => user ? user.photoURL : null)
  );

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
  }

  public register() {

  }

  public logIn(email: string, pass: string): void {
    this.authService.signIn(email, pass);
  }

  public logOut(): void {
    this.authService.signOut();
  }

  public googleLogIn(): void {
    this.authService.googleSignIn();
  }

  public emailLogIn(email: string): void {
    this.authService.sendSignInLinkToEmail(email);
  }

  // public signInAnonymously(): void {
  //   this.authService.signInAnonymously();
  // }

  public emailPassReset(email: string): void {
    this.authService.sendPasswordResetEmail(email);
  }
}
