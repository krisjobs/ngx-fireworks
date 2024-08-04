import { UrlParams } from "..";


// dynamic import
export const generateId = (collection: string) => {
  return this.firestoreService.newDocRef(collection).id;
}


export const getSearchString = (str?: string | null) => str?.toLowerCase().split(' ').join('') ?? null;


export const getDatabasePathFromParams = (urlParams: UrlParams): string => {
  const {
    moduleName,
    rootType,
    rootId,
    nestedType,
    nestedId,
    queryType,
    queryId,
  } = urlParams;

  if (moduleName === 'yachts') {
    if (rootType === 'equipment' && !!queryType) {
      return `boats/${queryId}/equipment/${rootId}`;
    } else if (rootType === 'equipment') {
      return `equipment/${rootId}`;
    } else {
      return `boats/${rootId}`;
    }
  } else if (moduleName === 'organizations') {
    if (nestedType === 'stays') {
      return `organizations/${rootId}/stays/${nestedId}`;
    } else {
      return `organizations/${rootId}`;
    }
  }

  return 'undefined';
}
