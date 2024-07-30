import {
  DocumentData, DocumentReference,
} from '@angular/fire/firestore';

export interface BatchWriteData {
  set?: [DocumentData, DocumentReference][];
  update?: [DocumentData, DocumentReference][];
  delete?: [DocumentData, DocumentReference][];
}
