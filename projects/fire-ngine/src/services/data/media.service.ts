
import { Inject, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

// ===================== MODELS =====================

import { SectionConfig, UrlEntities, UrlParams } from "src/app/styleguide";

// ===================== UTILITY =====================

// ===================== SERVICES =====================

import { AuthService } from "src/app/styleguide/modules/firebase/services/auth.service";
import { FirestoreService } from "src/app/styleguide/modules/firebase/services/firestore.service";
import { EntityRepository } from "src/app/styleguide/modules/library/services/entity.repository";
import { SECTION_CONFIG } from "src/app/styleguide/services/app.providers";
import { AppService } from "src/app/styleguide/services/app.service";
import { NotificationService } from "src/app/styleguide/services/notification.service";
import { DropzoneDialogComponent } from "../../library/components/organisms/dropzone-dialog/dropzone-dialog.component";
import { Entity } from "functions/src/styleguide/models";

// ===================== DEFINITIONS =====================

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  constructor(
    @Inject(SECTION_CONFIG) protected override sectionConfig: SectionConfig,
    protected override firestoreService: FirestoreService,
    protected override authService: AuthService,
    protected override notificationService: NotificationService,
    protected override appService: AppService,
    private dialog: MatDialog,
  ) {
    super(
      sectionConfig,
      firestoreService,
      authService,
      notificationService,
      appService,
    );
  }

  public bulkAddFiles$(url: UrlParams) {
    const dialogRef = this.dialog.open(
      DropzoneDialogComponent, {
      width: '88vh',
      height: '88vh',
      data: {
        url,
      },
    });
  }
}
