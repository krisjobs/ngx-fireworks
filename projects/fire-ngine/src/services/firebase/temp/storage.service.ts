import { Injectable } from '@angular/core';
import {
  deleteObject, getDownloadURL, ref, Storage,
  StorageReference, uploadBytes, UploadMetadata, UploadTask
} from '@angular/fire/storage';
import { uploadBytesResumable, UploadTaskSnapshot } from 'firebase/storage';
import { from, fromEventPattern, map, NEVER, Observable, switchMap } from 'rxjs';
import { AppService } from 'src/app/styleguide/services/app.service';

import { NotificationService } from 'src/app/styleguide/services/notification.service';


@Injectable()
export class StorageService {

  constructor(
    private storage: Storage,
    private notificationService: NotificationService,
    private appService: AppService
  ) { }

  public getBase64Url(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (error) => {
        this.notificationService.error('Error during base64 conversion.');
        reject(error)
      };
    });
  }

  public getDownloadUrl$(path: string): Observable<string> {
    const downloadRef = ref(this.storage, path);

    return from(
      getDownloadURL(downloadRef)
    );
  }

  public getStorageRef(path?: string): StorageReference {

    const storageRef = ref(this.storage, path);

    return storageRef;
  }

  public uploadFile$(
    file: File,
    path: string,
    withPercentage = false
  ): [UploadTask, Observable<UploadTaskSnapshot>] {

    const fileRef = this.getStorageRef(path);

    const metadata: UploadMetadata = {
      cacheControl: 'max-age=2592000,public'
    }

    if (!withPercentage) {
      return [null!, from(
        uploadBytes(fileRef, file, metadata)
          .then(
            (uploadResult) => {
              this.notificationService.message(`Uploaded ${uploadResult.ref.name}.`);
            }
          )
      ).pipe(
        switchMap(() => NEVER),
      )];
    } else {
      const uploadTask = uploadBytesResumable(fileRef, file, metadata);
      return [uploadTask, fromEventPattern(
        observer => uploadTask.on(
          'state_changed',
          observer,
          error => {
            this.notificationService.error(error.message);
          },
          () => {
            // Handle successful uploads on complete
          }
        )
      ).pipe(
        map(snapshot => snapshot as UploadTaskSnapshot)
      )];
    }
  }

  public deleteFile$(path: string) {
    const deleteRef = ref(this.storage, path);

    deleteObject(deleteRef);
  }

  public listFiles$(path: string) {
    // TODO
  }

  public getMetadata$(path: string) {
    // TODO
  }

  public updateMetadata$(path: string) {
    // TODO
    // can delete by setting to null
    // can create custom metadata
  }
}
