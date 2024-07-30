import { Injectable } from '@angular/core';
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';

// ===================== DEFINITIONS =====================

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(
    private notificationService: NotificationService,
    private router: Router,
  ) { }

  public throwErrorIfNotExist<T>(message: string, object?: T | null, context?: any): T {
    if (!object) {
      console.error(message, context);
      // this.notificationService.error(message);
      // this.router.navigateByUrl('/');
      throw new Error(message);
    }

    return object;
  }

  public throwError(message: string, context?: any): never {
    this.notificationService.error(message);
    console.error(message, context);
    throw new Error(message);
  }
}
