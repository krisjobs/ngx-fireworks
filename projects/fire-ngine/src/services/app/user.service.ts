import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { FirestoreService } from '../firebase/firestore.service';
import { AuthService } from '../firebase/auth.service';
// import { User } from 'lib-common/models';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  public get displayName(): string | null {
    return this.authService.currentUser && this.authService.currentUser.displayName;
  }

  public authUser$$ = this.authService.currentUser$$;

  public currentUser$$ = this.authService.currentUser$$.pipe(
    // tap(console.warn),
    switchMap(user => user ? this.firestoreService.getDoc$<any>('users', user.uid) : of(null))
  );

  public isLoggedIn$$: Observable<boolean> = this.authService.currentUser$$.pipe(
    map(user => !!user)
  );

  public isLoggedOut$$: Observable<boolean> = this.isLoggedIn$$.pipe(
    map((loggedIn: boolean) => !loggedIn)
  );

  public avatarUrl$$ = this.authService.currentUser$$.pipe(
    tap(x => console.warn(x)),
    map((user) => user ? user.photoURL : null)
  );

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService,
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
    // this.authService.sendSignInLinkToEmail(email);
  }

  // public signInAnonymously(): void {
  //   this.authService.signInAnonymously();
  // }

  public emailPassReset(email: string): void {
    this.authService.sendPasswordResetEmail(email);
  }
}

