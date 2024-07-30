import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EMPTY, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// ===================== MODELS =====================

// ===================== UTILITY =====================

// ===================== SERVICES =====================

import { StorageService } from 'src/app/styleguide/modules/firebase/services/storage.service';
import { AppService } from 'src/app/styleguide/services/app.service';
import { NotificationService } from 'src/app/styleguide/services/notification.service';

// ===================== DEFINITIONS =====================

@Component({
  selector: 'lib-dropzone',
  templateUrl: './dropzone.component.html',
  styleUrls: ['./dropzone.component.scss']
})
export class DropzoneComponent implements OnInit {

  @Input()
  public filePath!: string;

  @Input()
  public fileName?: string;

  @Input()
  public multiple?: boolean;

  @Output()
  public downloadUrl: EventEmitter<string> = new EventEmitter<string>();

  public readonly inputId = Date.now().toString();

  public base64Image?: string;

  public file?: File;

  public percentageChanges$!: Observable<number>;

  @ViewChild('dropzoneInput', { static: false, read: ElementRef })
  public dropzoneInput!: ElementRef<HTMLInputElement>;

  constructor(
    private storageService: StorageService,
    private appService: AppService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
  }

  public async onFilesSelect($event: Event) {
    const files = (<HTMLInputElement>$event.target)?.files;


    if (!!files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);

        if (!!file) {
          this.file = file;

          this.base64Image = file.name.endsWith('png') || file.name.endsWith('jpg') || file.name.endsWith('jpeg') ? await this.storageService.getBase64Url(file) : undefined; // prints the base64 string
          this.uploadImage()
        }
      }
    }
  }

  public uploadImage() {
    this.appService.loadingOn()

    const saveFileName = `${Date.now()}_${this.file!.name}`;
    // TODO CHECK HOW THIS IS DONE IN MEDIA ADAPTER
    const path = `${this.filePath}/${this.fileName ?? saveFileName}`;

    const [uploadTask, uploadTask$] = this.storageService.uploadFile$(
      this.file!,
      path,
      true
    );

    this.percentageChanges$ = uploadTask$.pipe(
      map(snapshot => (snapshot.bytesTransferred / snapshot.totalBytes) * 100),
    );

    uploadTask.then(
      (snapshot) => {
        this.storageService.getDownloadUrl$(path)
          .subscribe({
            next: (downloadUrl) => {
              this.downloadUrl.emit(downloadUrl);
              this.notificationService.message(`Uploaded ${snapshot.metadata.fullPath}.`);
              this.appService.loadingOff();
            }
          })
      }
    )
  }

  public clearImage() {
    // clear cached version of last file upload
    this.file = undefined;

    // clear image
    this.base64Image = undefined;

    // otherwise can't upload same file a second time immediately
    this.dropzoneInput.nativeElement.value = null!;

    // clear progress
    this.percentageChanges$ = EMPTY;
  }
}
