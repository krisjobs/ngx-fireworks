import {
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { environment } from 'src/environments/environment';

// ===================== loginUser =====================

Cypress.Commands.add('loginUser', (
  email = Cypress.env('ADMIN_EMAIL'),
  password = Cypress.env('ADMIN_PASS'),
) => {
  cy.session(
    email, // session id

    () => {
      const auth = getAuth();

      sessionStorage.setItem('appVersion', environment.version);

      cy.wrap(signInWithEmailAndPassword(
        auth,
        email,
        password
      )).then(
        (result: any) => {
          sessionStorage.setItem('userId', result.user.uid);
        }
      );
    }
  );
});
