import { Injectable } from "@angular/core";
import { Functions, httpsCallable } from "@angular/fire/functions";
import { InvokeFunctionParams } from "functions/src/styleguide/models";
import { BehaviorSubject, from, map, Observable, switchMap } from "rxjs";
import { firestoreCollections } from "src/app/shared/utility/firestore-collections";
@Injectable()
export class FunctionsService {
	private collectionIdsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

	constructor(private functions: Functions) {}

	// TODO transfer http to app calls
	public callFunction$(functionId: string, data: Partial<InvokeFunctionParams> = {}) {
		return from(httpsCallable(this.functions, functionId).call(undefined, data));
	}
}
