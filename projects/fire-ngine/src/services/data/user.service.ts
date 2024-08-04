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

  public getUserEntities$(
    path: string, // collection
    querySettings: QuerySettings,
  ): Observable<Entity[]> {
    if (!this.authService.currentUser) {
      const message = 'You are not authorozied for this operation.';
      this.notificationService.error(message);
      console.error(message); // TODO extract to method in service
      throw new Error(message);
    }

    return this.getEntities$(
      `${path}`,
      {
        ...querySettings,
        filters: [
          ...querySettings.filters,
          {
            name: 'isSubscribed',
            property: 'data.subscribers',
            value: this.authService.currentUser.uid,
            equality: 'array'
          }
        ]
      }
    );
  }

  public getUserEntities$$(
    path: string, // collection
    querySettings: QuerySettings,
  ): Observable<Entity[]> {
    if (!this.authService.currentUser) {
      const message = 'You are not authorozied for this operation.';
      this.notificationService.error(message);
      console.error(message); // TODO extract to method in service
      throw new Error(message);
    }

    return this.getEntities$$(
      `${path}`,
      {
        ...querySettings,
        filters: [
          ...querySettings.filters,
          {
            name: 'isSubscribed',
            property: 'data.subscribers',
            value: this.authService.currentUser.uid,
            equality: 'array'
          }
        ]
      }
    ).pipe(
      // switchMap(entities => this.firestoreService.runTransaction$(() => {

      // }) as Observable<Entity[]>)
    );
  }
}

