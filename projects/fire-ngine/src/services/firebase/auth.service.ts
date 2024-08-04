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
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { Router } from '@angular/router';

import { Observable, fromEventPattern, map, from, switchMap, tap, of } from 'rxjs';
import { UserCustomClaims, UserProfileUpdate } from '../../common/models';

// ===================== MODELS =====================


// ===================== UTILITY =====================


// ===================== SERVICES =====================


// ===================== DEFINITIONS =====================


@Injectable()
export class AuthService {

  public get currentUser(): User | null {
    return this.auth.currentUser;
  }

  public get loggedUser(): User {
    if (!this.currentUser) {
      throw new Error('User is not logged');
    }

    return this.currentUser;
  }

  private idToken$$ = fromEventPattern(
    observer => this.auth.onIdTokenChanged(observer)
  ).pipe(
    switchMap((user) => {
      const currentUser = user as User | null;
      return currentUser ? currentUser.getIdTokenResult() : of(null);
    }),
  );

  public userRoles$$ = this.idToken$$.pipe(
    map(token => {
      const customClaims = token?.claims as unknown as UserCustomClaims | null;
      return customClaims ? customClaims.roles : null;
    }),
  );

  public currentUser$$: Observable<User | null> = fromEventPattern(
    observer => onAuthStateChanged(this.auth, observer)
  ).pipe(
    map((user) => {
      const currentUser = user as User | null;

      if (currentUser) {
        // const uid = currentUser.uid;
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
    private router: Router,
  ) { }

  public signOut(): void {
    from(signOut(this.auth))
      .pipe()
      .subscribe({
        complete: () => {
          console.warn('User logged out.');
          // this.router.navigateByUrl('/user');
        },
        error: (error: Error) => {
          console.error(error.message);

          console.error(`Could not sign out.`);
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
          console.warn(`Hello, ${user.displayName || 'welcome back'}!`);

          this.router.navigateByUrl('/');
        },
        error: (error: Error) => {
          console.error(error.message);

          console.error(`Could not sign in.`);
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
          console.warn(`Welcome!`, user);
        },
        complete: () => {
          this.router.navigate(['/']);
        },
        error: (error: Error) => {
          console.error(error.message);

          console.error(`Could not sign up.`);
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

          console.warn(`Hello, ${user.displayName || 'welcome back'}!`);
        },
        complete: () => {
          this.router.navigateByUrl('/');
        },
        error: (error: any) => {
          const errorCode = error.code;
          // The email of the user's account used.
          const email = error.customData.email;
          console.error(error.message, [errorCode, email]);

          console.error(`Could not sign in with Google.`);
        }
      });
  }

  public sendEmailVerification(user: User) {
    from(sendEmailVerification(user))
      .subscribe({
        complete: () => {
          console.warn(`Verification email sent.`);
        },
        error: (error: Error) => {
          console.error(error.message);
          console.error(`Could not send email verification.`);
        }
      });
  }

  public sendPasswordResetEmail(email: string) {
    from(sendPasswordResetEmail(this.auth, email))
      .subscribe({
        complete: () => {
          console.warn(`Password reset email sent.`);
        },
        error: (error: Error) => {
          console.error(error.message);
          console.error(`Could not send password reset email.`);
        }
      });
  }

  // public signInAnonymously() {
  //   from(signInAnonymously(this.auth))
  //     .subscribe({
  //       complete: () => {
  //         console.warn(`Logged in as anonymous.`);
  //       },
  //       error: (error: Error) => {
  //         console.error(error.message);

  //         console.error(`Could not login as anonymous.`);
  //       }
  //     });
  // }

  // public sendSignInLinkToEmail(email: string) {
  //   const settings: ActionCodeSettings = {
  //     // URL you want to redirect back to. The domain (www.example.com) for this
  //     // URL must be in the authorized domains list in the Firebase Console.
  //     url: `${environment.user.emailSignIn}`,
  //     // This must be true.
  //     handleCodeInApp: true,

  //     // iOS: {
  //     //   bundleId: 'com.example.ios'
  //     // },
  //     // android: {
  //     //   packageName: 'com.example.android',
  //     //   installApp: true,
  //     //   minimumVersion: '12'
  //     // },
  //     // dynamicLinkDomain: 'example.page.link'
  //   };

  //   from(sendSignInLinkToEmail(this.auth, email, settings))
  //     .subscribe({
  //       complete: () => {
  //         // The link was successfully sent. Inform the user.
  //         console.warn(`Login link email sent.`);

  //         // Save the email locally so you don't need to ask the user for it again
  //         // if they open the link on the same device.
  //         window.localStorage.setItem('user.auth.email', email);
  //       },
  //       error: (error: Error) => {
  //         console.error(error.message, [email, settings]);

  //         console.error(`Could not send login email link.`);
  //       }
  //     });
  // }

  public isSignInWithEmailLink(link: string) {
    return isSignInWithEmailLink(this.auth, link);
  }

  public signInWithEmailLink(email: string, link: string) {
    from(signInWithEmailLink(this.auth, email, link))
      .subscribe({
        next: (userCredential: UserCredential) => {
          // "link" | "reauthenticate" | "signIn"
          console.warn('WOW', userCredential.operationType);

          console.warn(`Hello, ${userCredential.user.displayName || 'welcome back'}!`);
        },
        complete: () => {
          this.router.navigate(['/']);

          // Clear email from storage.
          window.localStorage.removeItem('user.auth.email');
        },
        error: (error: Error) => {
          console.error(error.message, [email, link]);
          console.error(`Could not send sign in with email link.`);
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

          console.warn(`Updated user profile.`);
        },
        error: (error: Error) => {
          console.error(error.message, [update.displayName, update.photoURL]);
          console.error(`Could not update user profile.`);
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

          console.warn(`Updated user email.`);
        },
        error: (error: Error) => {
          console.error(error.message, [newEmail]);
          console.error(`Could not update user email.`);
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
    const credential = EmailAuthProvider.credential(
      this.auth.currentUser.email!,
      oldPassword
    );

    from(reauthenticateWithCredential(this.auth.currentUser, credential))
      .pipe(
        switchMap((userCredential: UserCredential) => updatePassword(userCredential.user, newPassword))
      )
      .subscribe({
        complete: () => {

          console.warn(`Updated user password.`);
        },
        error: (error: Error) => {
          console.error(error.message);
          console.error(`Could not update password.`);
        }
      });
  }

}
