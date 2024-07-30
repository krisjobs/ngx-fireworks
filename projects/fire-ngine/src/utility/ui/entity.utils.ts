import { UrlParams } from "..";

export const getSearchString = (str?: string | null) => str?.toLowerCase().split(' ').join('') ?? null;

export const getParamsFromUrl = (url: string): UrlParams => {
  const urlSegments = url.split('/');

  let inFiles = urlSegments[urlSegments.length - 1] === 'files';

  if (inFiles) {
    urlSegments.pop();
  }

  let urlParams: UrlParams = {
    rawUrl: url,
    moduleName: urlSegments[1] // undefined on root
  };

  if (urlSegments.length === 1) { // domain (root)
    return urlParams;
  } else if (urlSegments.length === 2) { // domain/module
    return urlParams;
  } else if (urlSegments.length === 3) { // domain/module/rootType[?queryType=queryId]
    const urlSegments2 = urlSegments[2].split('?');
    const [
      rootType,
      urlSegments3Raw // optional
    ] = urlSegments2;
    const urlSegments3 = urlSegments3Raw?.split('=') ?? [];
    const [
      queryType,
      queryId
    ] = urlSegments3;

    urlParams = {
      ...urlParams,
      rootType,
      queryType,
      queryId,
    };
  } else if (urlSegments.length === 4) { // domain/module/entity/entityId
    const [
      _,
      __,
      nestedType,
      nestedId,
    ] = urlSegments;

    urlParams = {
      ...urlParams,
      nestedType,
      nestedId,
    };
  } else if (urlSegments.length === 5) { // domain/module/parent/parentId/entity[?related=relatedId]
    const [
      _,
      __,
      rootType,
      rootId,
      urlSegments2Raw,
    ] = urlSegments;
    const urlSegments2 = urlSegments2Raw.split('?');
    const [
      nestedType,
      urlSegments3Raw // optional
    ] = urlSegments2;
    const urlSegments3 = urlSegments3Raw?.split('=') ?? [];
    const [
      queryType,
      queryId
    ] = urlSegments3;

    urlParams = {
      ...urlParams,
      rootType,
      rootId,
      nestedType,
      queryType,
      queryId,
    };
  } else { // domain/module/parent/parentId/entity/entityId
    const [
      _,
      __,
      rootType,
      rootId,
      nestedType,
      nestedId,
    ] = urlSegments;

    urlParams = {
      ...urlParams,
      rootType,
      rootId,
      nestedType,
      nestedId,
    };
  }

  return urlParams;
}

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
