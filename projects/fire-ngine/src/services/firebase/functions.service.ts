import { Injectable } from "@angular/core";
import { Functions, httpsCallable, HttpsCallableResult } from "@angular/fire/functions";
import { from, map } from "rxjs";
import { InvokeFunctionParams } from "../../../../../common/models";

@Injectable()
export class FunctionsService {

  constructor(
    private functions: Functions
  ) { }

  // TODO transfer http to app calls
  public callFunction$<T = unknown>(functionId: string, data: InvokeFunctionParams = {}) {
    const firebaseFunction = httpsCallable(this.functions, functionId);
    return from(firebaseFunction(data)).pipe(
      map((result: HttpsCallableResult) => result.data as T)
    );
  }
}
