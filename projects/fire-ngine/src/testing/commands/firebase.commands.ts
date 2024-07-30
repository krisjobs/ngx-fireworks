import {
  getAuth,
  connectAuthEmulator,
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  getDoc,
  getDocs,
  doc,
  collection,
  initializeFirestore,
} from 'firebase/firestore';
import {
  getStorage,
  connectStorageEmulator,
  getDownloadURL,
  ref,
  listAll,
  ListResult
} from 'firebase/storage';
import {
  initializeApp
} from 'firebase/app';
import { environment } from '../../../src/environments/environment'
import { ports } from '../../../src/app/shared/utility/firebase-ports'
import { Entity } from '../../../functions/src/styleguide/models';


// ===================== INIT =====================

Cypress.Commands.add('initFirebase', () => {
  const app = initializeApp(environment.firebase);

  // replicate get/initialize logic from firebase module
  const auth = getAuth();
  const firestore = initializeFirestore(app, {
    experimentalForceLongPolling: !environment.production,
  });
  const storage = getStorage();

  connectAuthEmulator(auth, `http://localhost:${ports.auth}`);
  connectFirestoreEmulator(firestore, 'localhost', ports.firestore);
  connectStorageEmulator(storage, 'localhost', ports.storage);

  cy.log('initFirebase -> successful');
});

// ===================== getDocument =====================

Cypress.Commands.add("getDocument", { prevSubject: 'optional' }, (subject, {
  colPath,
  docId,
  storeAs,
}) => {
  const firestore = getFirestore();

  const path = `/${colPath}/${docId}`;
  const docRef = doc(firestore, path);
  return cy
    .log(`getDocument -> ${path}`)
    .wrap(
      getDoc(docRef).then(
        (doc) => ({
          id: doc.id,
          ...doc.data()
        })
      ).then(
        (doc) => {
          if (storeAs) {
            const serialized = JSON.stringify(doc);
            sessionStorage.setItem(storeAs, serialized);
          }

          return doc;
        }
      ),
      { log: false }
    );
});

// ===================== checkDocument =====================

Cypress.Commands.add("checkDocument", { prevSubject: 'optional' }, (subject, {
  colPath,
  docId,
  targetId,
  equalityFn
}) => {
  cy.log(`checkDocument -> ${colPath}/${docId}`);

  cy.getCollection({
    colPath,
    asMap: true,
    storeAs: `${colPath}Collection`
  }).then(
    (collection: any) => {
      const $docId = docId ?? sessionStorage.getItem('createId') ?? sessionStorage.getItem('updateId');
      const document = collection[$docId!];

      const $targetId = targetId ?? sessionStorage.getItem('targetId')!;
      let target;
      if ($docId !== $targetId) {
        target = collection[targetId ?? sessionStorage.getItem('targetId')!];
      }

      equalityFn!(document, target);
    }
  );
});

// ===================== getCollection =====================

Cypress.Commands.add("getCollection", { prevSubject: 'optional' }, (subject, {
  colPath,
  asMap,
  storeAs,
  queryFilter,
}) => {
  const firestore = getFirestore();

  const path = `${colPath}`;
  const colRef = collection(firestore, path);
  return cy
    .log(`getCollection -> ${path}`)
    .wrap(
      getDocs(colRef).then(
        (snapshot) => {
          let docs = snapshot.docs
            .map(
              (doc) => ({
                id: doc.id,
                ...doc.data()
              } as Entity)
            );

          if (!!queryFilter) {
            docs = docs.filter(queryFilter);
          }

          if (asMap) {
            return docs.reduce(
              (map, doc) => ({
                ...map,
                [doc.id]: doc
              }),
              {}
            );
          } else {
            return docs;
          }
        }
      ).then(
        (docs) => {
          if (storeAs) {
            const serialized = JSON.stringify(docs);
            sessionStorage.setItem(storeAs, serialized);
          }

          return docs;
        }
      ),
      { log: false }
    );
});

// ===================== checkCollection =====================

Cypress.Commands.add("checkCollection", { prevSubject: 'optional' }, (subject, {
  colPath,
  operation,
  customOperation,
  queryFilter,
}) => {
  cy.log(`checkCollection -> ${colPath}`);

  cy.getCollection({
    colPath,
    queryFilter,
  }).then(
    (documents: any[]) => {
      const rawLength = sessionStorage.getItem(`${colPath}Size`);
      const newLength = documents.length;

      if (!!rawLength) {
        const oldLength = parseInt(rawLength);
        const increment = operation === 'edit' || operation === 'unarchive' || operation === 'archive' ? 0 : (
          operation === 'create' || operation === 'copy' ? 1 : (customOperation ? 1 : -1)
        );

        expect(newLength).to.equal(oldLength + increment, 'collection size');
      }

      sessionStorage.setItem(`${colPath}Size`, newLength.toString());
    });
});

// ===================== getStorageUrl =====================

Cypress.Commands.add("getStorageListings", { prevSubject: 'optional' }, (subject, {
  filePath,
  docId,
}) => {
  const storage = getStorage();
  const fullPath = `images/${filePath}/${docId ?? sessionStorage.getItem('createId') ?? sessionStorage.getItem('updateId')}`

  cy.log(`getFileUrl -> ${fullPath}`);

  const storageRef = ref(storage, fullPath);

  return cy.wrap(
    listAll(storageRef).then(
      (result) => {
        const listings = (result as ListResult).items
          .map(
            (listing) => listing.fullPath
          );

        return listings;
      },
    ),
    { log: false }
  );
});

// ===================== getStorageUrl =====================

Cypress.Commands.add("getStorageUrl", { prevSubject: 'optional' }, (subject, {
  filePath,
  fileName,
  docId,
}) => {
  const storage = getStorage();

  cy.log(`getFileUrl -> ${filePath}`);

  return cy.getStorageListings({
    filePath,
    docId
  }).then(
    listings => {
      const fullPath = listings.filter(
        (listing) => listing.includes(fileName!)
      ).reverse()[0];

      const fileRef = ref(storage, fullPath)

      return cy.wrap(
        getDownloadURL(fileRef),
        { log: false }
      );
    }
  );
});
