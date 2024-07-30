export function getFileName(entityName: string = 'files') {
  return `${entityName}_${new Date().toISOString()}`.replace(' ', '_');
}
