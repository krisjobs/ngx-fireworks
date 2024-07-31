import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
  User,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  sendEmailVerification,
  updatePassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendSignInLinkToEmail,
  ActionCodeSettings,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, fromEventPattern, map, from, switchMap, tap, of } from 'rxjs';

// ===================== MODELS =====================

import { UserRoles, UserProfileUpdate } from 'functions/src/styleguide/models';

// ===================== UTILITY =====================

import { environment } from 'src/environments/environment';

// ===================== SERVICES =====================

import { ErrorService } from 'src/app/styleguide/services/error.service';
import { NotificationService } from 'src/app/styleguide/services/notification.service';

// ===================== DEFINITIONS =====================


@Injectable()
export class AuthService {

  public get currentUser(): User | null {
    return this.auth.currentUser;
  }

  public get loggedUser(): User {
    const user = this.errorService.throwErrorIfNotExist('User is not logged', this.currentUser);

    return user;
  }

  public idToken$$ = fromEventPattern(
    observer => this.auth.onIdTokenChanged(observer)
  ).pipe(
    switchMap((user) => (user as User).getIdToken()),
  );

  public idTokenResult$$ = fromEventPattern(
    observer => this.auth.onIdTokenChanged(observer)
  ).pipe(
    map(user => (user as User | null)),
    switchMap((user) => user ? user.getIdTokenResult() : of(null)),
  );

  public userRoles$$: Observable<UserRoles> = this.idTokenResult$$.pipe(
    map(token => token?.claims as any || { admin: false })
  )

  public currentUser$$: Observable<User | null> = fromEventPattern(
    observer => onAuthStateChanged(this.auth, observer)
  ).pipe(
    map((user) => {
      const currentUser = user as User | null;

      if (currentUser) {
        const uid = currentUser.uid;
        // ...
      } else {
        // User is signed out
        // ...
      }

      return currentUser;
    })
  );

  constructor(
    private auth: Auth,
    private notificationService: NotificationService,
    private router: Router,
    private errorService: ErrorService,
  ) { }

  public signOut(): void {
    from(signOut(this.auth))
      .pipe()
      .subscribe({
        complete: () => {
          this.notificationService.message('User logged out.');
          this.router.navigateByUrl('/user');
        },
        error: (error: Error) => {
          console.error(error.message);

          this.notificationService.error(`Could not sign out.`);
        }
      });
  }

  public signIn(email: string, pass: string): void {
    from(signInWithEmailAndPassword(this.auth, email, pass))
      .pipe(
        map((userCredential: UserCredential) => userCredential.user),
        // switchMap((currentUser: User) => {
        //   if (currentUser && currentUser.emailVerified) {
        //     return this.updateProfile$(currentUser, {
        //       displayName: name
        //     });
        //   } else {
        //     throw new Error('Please verify email first.');
        //   }
        // })
      )
      .subscribe({
        next: (user) => {
          this.notificationService.message(`Hello, ${user.displayName || 'welcome back'}!`);

          this.router.navigateByUrl('/');
        },
        error: (error: Error) => {
          console.error(error.message);

          this.notificationService.error(`Could not sign in.`);
        }
      });
  }

  public signUp(email: string, pass: string) {
    from(createUserWithEmailAndPassword(this.auth, email, pass))
      .pipe(
        map((userCredential: UserCredential) => userCredential.user),
        tap((user) => this.sendEmailVerification(user))
      )
      .subscribe({
        next: (user) => {
          this.notificationService.message(`Welcome!`);
        },
        complete: () => {
          this.router.navigate(['/']);
        },
        error: (error: Error) => {
          console.error(error.message);

          this.notificationService.error(`Could not sign up.`);
        }
      });
  }

  public googleSignIn() {
    const provider = new GoogleAuthProvider();

    from(signInWithPopup(this.auth, provider))
      .subscribe({
        next: (userCredential: UserCredential) => {
          // The signed-in user info.
          const user = userCredential.user;

          this.notificationService.message(`Hello, ${user.displayName || 'welcome back'}!`);
        },
        complete: () => {
          this.router.navigateByUrl('/');
        },
        error: (error: any) => {
          const errorCode = error.code;
          // The email of the user's account used.
          const email = error.customData.email;
          console.error(error.message, [errorCode, email]);

          this.notificationService.error(`Could not sign in with Google.`);
        }
      });
  }

  public sendEmailVerification(user: User) {
    from(sendEmailVerification(user))
      .subscribe({
        complete: () => {
          this.notificationService.message(`Verification email sent.`);
        },
        error: (error: Error) => {
          console.error(error.message);
          this.notificationService.error(`Could not send email verification.`);
        }
      });
  }

  public sendPasswordResetEmail(email: string) {
    from(sendPasswordResetEmail(this.auth, email))
      .subscribe({
        complete: () => {
          this.notificationService.message(`Password reset email sent.`);
        },
        error: (error: Error) => {
          console.error(error.message);
          this.notificationService.error(`Could not send password reset email.`);
        }
      });
  }

  // public signInAnonymously() {
  //   from(signInAnonymously(this.auth))
  //     .subscribe({
  //       complete: () => {
  //         this.notificationService.message(`Logged in as anonymous.`);
  //       },
  //       error: (error: Error) => {
  //         console.error(error.message);

  //         this.notificationService.error(`Could not login as anonymous.`);
  //       }
  //     });
  // }

  public sendSignInLinkToEmail(email: string) {
    const settings: ActionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be in the authorized domains list in the Firebase Console.
      url: `${environment.user.emailSignIn}`,
      // This must be true.
      handleCodeInApp: true,

      // iOS: {
      //   bundleId: 'com.example.ios'
      // },
      // android: {
      //   packageName: 'com.example.android',
      //   installApp: true,
      //   minimumVersion: '12'
      // },
      // dynamicLinkDomain: 'example.page.link'
    };

    from(sendSignInLinkToEmail(this.auth, email, settings))
      .subscribe({
        complete: () => {
          // The link was successfully sent. Inform the user.
          this.notificationService.message(`Login link email sent.`);

          // Save the email locally so you don't need to ask the user for it again
          // if they open the link on the same device.
          window.localStorage.setItem('user.auth.email', email);
        },
        error: (error: Error) => {
          console.error(error.message, [email, settings]);

          this.notificationService.error(`Could not send login email link.`);
        }
      });
  }

  public isSignInWithEmailLink(link: string) {
    return isSignInWithEmailLink(this.auth, link);
  }

  public signInWithEmailLink(email: string, link: string) {
    from(signInWithEmailLink(this.auth, email, link))
      .subscribe({
        next: (userCredential: UserCredential) => {
          // "link" | "reauthenticate" | "signIn"
          console.warn('WOW', userCredential.operationType);

          this.notificationService.message(`Hello, ${userCredential.user.displayName || 'welcome back'}!`);
        },
        complete: () => {
          this.router.navigate(['/']);

          // Clear email from storage.
          window.localStorage.removeItem('user.auth.email');
        },
        error: (error: Error) => {
          console.error(error.message, [email, link]);
          this.notificationService.error(`Could not send sign in with email link.`);
        }
      });
  }

  public updateProfile(
    update: Partial<UserProfileUpdate>
  ): void {

    if (!this.auth.currentUser) {
      throw new Error('You must login, in order to update your profile.');
    }

    from(updateProfile(this.auth.currentUser, update))
      .pipe(
    )
      .subscribe({
        complete: () => {
          window.location.reload();

          this.notificationService.message(`Updated user profile.`);
        },
        error: (error: Error) => {
          console.error(error.message, [update.displayName, update.photoURL]);
          this.notificationService.error(`Could not update user profile.`);
        }
      });
  }

  public updateEmail(
    newEmail: string
  ): void {

    if (!this.auth.currentUser) {
      throw new Error('You must login, in order to update your email.');
    }

    from(updateEmail(this.auth.currentUser, newEmail))
      .pipe()
      .subscribe({
        complete: () => {
          // window.location.reload();

          this.notificationService.message(`Updated user email.`);
        },
        error: (error: Error) => {
          console.error(error.message, [newEmail]);
          this.notificationService.error(`Could not update user email.`);
        }
      });
  }

  public updatePassword(
    oldPassword: string,
    newPassword: string
  ): void {
    if (!this.auth.currentUser) {
      throw new Error(`You must be logged in to change password.`);
    }

    // Prompt the user to re-provide their sign-in credentials
    var credential = EmailAuthProvider.credential(
      this.auth.currentUser.email!,
      oldPassword
    );

    from(reauthenticateWithCredential(this.auth.currentUser, credential))
      .pipe(
        switchMap((userCredential: UserCredential) => updatePassword(userCredential.user, newPassword))
      )
      .subscribe({
        complete: () => {

          this.notificationService.message(`Updated user password.`);
        },
        error: (error: Error) => {
          console.error(error.message);
          this.notificationService.error(`Could not update password.`);
        }
      });
  }

}
