import { Injectable } from '@angular/core';
import {
  DocumentReference, addDoc, CollectionReference,
  DocumentData, getDocs,
  onSnapshot, Query, DocumentSnapshot,
  QueryDocumentSnapshot, QuerySnapshot, getDoc,
  query, collection, Firestore, updateDoc, doc,
  QueryConstraint, collectionGroup, setDoc,
  writeBatch, runTransaction, deleteDoc, Transaction
} from "@angular/fire/firestore";
import { from, fromEventPattern, Observable } from "rxjs";
import { map } from "rxjs/operators";

// ===================== MODELS =====================

import { BatchWriteData } from 'functions/src/styleguide/models';

// ===================== DEFINITIONS =====================

@Injectable()
export class FirestoreService {

  constructor(
    private firestore: Firestore,
  ) { }

  public path2ancestor(path: string) {
    return path.split('/').slice(0, -1).join('/');
  }

  public path2ancestorDiff(path: string) {
    return path.split('/').splice(-1)[0];
  }

  private getDocsQuery(path: string): Query<DocumentData> {
    if (path.startsWith('$')) {
      return collectionGroup(this.firestore, path.slice(1));
    } else {
      return collection(this.firestore, path);
    }
  }

  public newDocRef(collectionPath: string): DocumentReference {
    return doc(collection(this.firestore, collectionPath));
  }

  public getDocRef(collectionPath: string, docId: string): DocumentReference {
    const colRef: CollectionReference<DocumentData> = collection(this.firestore, collectionPath);
    const docRef: DocumentReference<DocumentData> = doc(colRef, docId);

    return docRef;
  }

  public addDoc$<T extends DocumentData>(path: string, data: T): Observable<T> {
    const colRef: CollectionReference<DocumentData> = collection(this.firestore, path);

    const {
      id: dataId,
      path: dataPath,
      qry,
      ...rawData
    } = data;

    return from(addDoc<DocumentData>(colRef, {
      ...rawData
    })).pipe(
      map(
        (docRef: DocumentReference) => ({
          ...rawData,
          id: docRef.id,
          path: this.path2ancestor(docRef.path),
        } as unknown as T)
      )
    );
  }

  public setDoc$<T extends DocumentData>(docRef: DocumentReference, data: T): Observable<T> {
    const {
      id: dataId,
      path: dataPath,
      qry,
      ...rawData
    } = data;

    return from(setDoc<DocumentData>(docRef, {
      ...rawData
    })).pipe(
      map(
        () => ({
          id: docRef.id,
          path: this.path2ancestor(docRef.path),
          ...rawData
        } as unknown as T)
      )
    );
  }

  /**
   * Get a cold observable of a single entity
   * @param path
   * @param docId
   * @returns
   */
  public getDoc$<T>(
    path: string,
    docId: string
  ): Observable<T> {
    const colRef: CollectionReference<DocumentData> = collection(this.firestore, path);
    const docRef: DocumentReference<DocumentData> = doc(colRef, docId);

    return from(getDoc(docRef)).pipe(
      map(
        (docSnap: DocumentSnapshot) => {
          const data = docSnap.data();

          if (!!data) {
            const doc = {
              id: docSnap.id,
              path: this.path2ancestor(docSnap.ref.path),
              ...data
            } as unknown as T;

            return doc;
          } else {
            throw new Error('Invalid document.');
          }
        }
      )
    );
  }

  /**
   * Get a hot observable of a single entity
   * @param path
   * @param docId
   * @returns
   */
  public getDoc$$<T>(
    path: string,
    docId: string
  ): Observable<T> {
    const colRef: CollectionReference<DocumentData> = collection(this.firestore, path);
    const docRef: DocumentReference<DocumentData> = doc(colRef, docId);

    return fromEventPattern(
      observer => onSnapshot(docRef, observer, (error) => {
        console.error(error);
      })
    ).pipe(
      map(
        (docSnap: any) => {
          const doc = {
            id: docSnap.id,
            path: this.path2ancestor(docSnap.ref.path),
            ...docSnap.data()
          } as unknown as T;

          return doc;
        }
      )
    )
  }

  /**
   * Get a cold observable of all entities
   * @param path
   * @param constraints
   * @returns
   */
  public getDocs$<T>(
    path: string,
    ...constraints: QueryConstraint[]
  ): Observable<T[]> {
    const colRef: CollectionReference<DocumentData> = collection(this.firestore, path);
    const colQuery: Query<DocumentData> = query(
      colRef,
      ...constraints
    );

    return from(getDocs(colQuery)).pipe(
      map((qrySnap: QuerySnapshot<DocumentData>) => qrySnap.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          path: this.path2ancestor(doc.ref.path),
          qry: doc,
          ...doc.data()
        } as unknown as T)
      ))
    );
  }

  /**
   * Get a hot observable of all entities
   * @param path
   * @param constraints
   * @returns
   */
  public getDocs$$<T>(
    path: string,
    ...constraints: QueryConstraint[]
  ): Observable<T[]> {
    const docsQuery: Query<DocumentData> = query(
      this.getDocsQuery(path),
      ...constraints
    );

    return fromEventPattern(
      observer => onSnapshot(docsQuery, observer, (error) => {
        console.error(error);
      })
    ).pipe(
      map((qrySnap: unknown) => (qrySnap as QuerySnapshot<DocumentData>).docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          path: this.path2ancestor(doc.ref.path),
          qry: doc,
          ...doc.data()
        } as unknown as T)
      ))
    );
  }

  public updateDoc$<T extends DocumentData>(path: string, data: T): Observable<T> {
    const {
      id: dataId,
      path: dataPath,
      qry,
      ...rawData
    } = data;

    const colRef: CollectionReference<DocumentData> = collection(this.firestore, path);
    const docRef = doc(colRef, dataId);

    return from(updateDoc(docRef, rawData)).pipe(
      map(() => data)
    );
  }

  public deleteDoc$<T extends DocumentData>(path: string, data: T): Observable<T> {
    const {
      id: dataId,
      path: dataPath,
    } = data;

    const colRef: CollectionReference<DocumentData> = collection(this.firestore, path);
    const docRef = doc(colRef, dataId);
    return from(deleteDoc(docRef)).pipe(
      map(() => data)
    );
  }

  public batchWrite$(data: BatchWriteData) {
    // console.warn(data)
    const batch = writeBatch(this.firestore);

    if (!!data.set) {
      data.set.forEach(
        ([
          {
            id: docId,
            path: docPath,
            qry,
            ...docData
          },
          docRef
        ]) => {
          // console.warn(docRef.id)
          batch.set(docRef, docData);
        }
      );
    }

    if (!!data.update) {
      data.update.forEach(
        ([
          {
            id: docId,
            path: docPath,
            qry,
            ...docData
          },
          docRef
        ]) => {
          batch.update(docRef, docData);
        }
      );
    }

    if (!!data.delete) {
      data.delete.forEach(
        ([
          {
            id: docId,
            ...docData
          },
          docRef
        ]) => {
          batch.delete(docRef);
        }
      );
    }

    // Commit the batch
    return from(batch.commit());
  }

  public runTransaction$<T = unknown>(transactionFunction: (transaction: Transaction) => Promise<T>) {

    return from(runTransaction(this.firestore, transactionFunction));
  }
}
