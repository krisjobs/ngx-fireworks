export function insertIf(condition: boolean, ...elements: any[]): any[] {
  return condition ? elements : [];
}

export function insertIfNotEmpty(object: any, ...elements: any[]) {
  return insertIf(!!object && !!Object.keys(object).length, elements).flat();
}

// 4-digits
export function randomDigits(): string {
  return Date.now().toString().slice(-4);
}

export function getTimestamps(): [number, number] {
  return [parseInt(sessionStorage.getItem('timestampStart')!), parseInt(sessionStorage.getItem('timestampStop')!)];
}