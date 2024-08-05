import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// ===================== MODELS =====================

import { SectionConfig, ModalData } from 'src/app/styleguide';
import { EntityFile, FileType } from 'functions/src/styleguide/models';

// ===================== UTILITY =====================

// ===================== SERVICES =====================

import { SECTION_CONFIG } from 'src/app/styleguide/services/app.providers';
import { EntityService } from '../../../services/entity.service';
import { FirestoreService } from 'src/app/styleguide/modules/firebase/services/firestore.service';
import { getDatabasePathFromParams } from 'src/app/styleguide/utility/entity.util';
import { FileService } from 'src/app/styleguide/modules/media/services/file.service';
import { AuthService } from 'src/app/styleguide/modules/firebase/services/auth.service';
import { getFileType } from 'src/app/styleguide/utility/media.util';

// ===================== DEFINITIONS =====================


@Component({
  selector: 'lib-dropzone-dialog',
  templateUrl: './dropzone-dialog.component.html',
  styleUrls: ['./dropzone-dialog.component.scss'],
})
export class DropzoneDialogComponent implements OnInit {

  private downloadLinks: string[] = [];

  public get title(): string {
    return this.dialogData.title || 'Dropzone dialog';
  }

  public get filePath(): string {
    return `images/${this.dialogData.url.rootType}/${this.dialogData.url.rootId}/files`;
  }

  // TODO make this function not bbo-specific but configurable
  public get documentPath(): string {
    const dbPath = getDatabasePathFromParams(this.dialogData.url);
    return `${dbPath}/media`;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: any,
    @Inject(SECTION_CONFIG) private config: SectionConfig,
    private entityService: EntityService,
    private firestoreService: FirestoreService,
    private fileService: FileService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<DropzoneDialogComponent>,
  ) {

  }

  ngOnInit(): void {
  }

  onFileUpload(downloadUrl: string): void {
    const rawEntity = this.entityService.generateRawEntity();
    this.downloadLinks.push(downloadUrl);
    const fileName = downloadUrl.split('%2F').reverse()[0].split('?alt=media')[0].split('_')[1].slice(0, 40).replace(/%20/g, ' ').slice(0, -4);

    let file: EntityFile = {
      ...rawEntity,
      information: {
        name: fileName,
        fileUrl: downloadUrl,
      },
      data: {
        ...rawEntity.data,
        uploaderName: this.authService.currentUser?.displayName
      },
      stats: {
        ...rawEntity.stats,
        updatedAt: rawEntity.stats?.createdAt,
      },
    } as EntityFile;

    const fileType = getFileType(file);
    file = {
      ...file,
      attributes: {
        ...file.attributes,
        type: 'file',
        class: fileType,
      },
      media: {
        defaultUrl: fileType === FileType.Image ?
          file.information.fileUrl :
          (fileType === FileType.Excel ?
            'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg/640px-Microsoft_Office_Excel_%282019%E2%80%93present%29.svg.png' :
            (fileType === FileType.Word ?
              'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg/640px-Microsoft_Office_Word_%282019%E2%80%93present%29.svg.png' :
              (fileType === FileType.PDF ?
                'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/640px-PDF_file_icon.svg.png' :
                'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Generic_File_OneDrive_icon.svg/640px-Generic_File_OneDrive_icon.svg.png'
              )
            )
          )
      }
    };

    // TODO - fix for nested entities (yacht/equipment)
    // ! currently URL does not support it
    this.firestoreService.addDoc$(this.documentPath, file);
  }

  public closeForm(): void {
    this.dialogRef.close();
  }
}
