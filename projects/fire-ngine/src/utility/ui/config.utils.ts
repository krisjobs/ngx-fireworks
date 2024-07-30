
export const selectFromArray: <T>(selection: string[], array: Array<T>, key: string) => Array<T> = <T>(selection: string[], array: Array<T>, key: string) => {
  const arrayMap = new Map<string, T>();

  array.forEach(
    (element) => arrayMap.set(eval(`element.${key}`), element)
  );

  return selection.reduce(
    (selectionArray, selectionKey) => {
      const element = arrayMap.get(selectionKey);

      if (!!element) {
        selectionArray.push(element);
        return selectionArray;
      } else {
        throw new Error(`Unknown selection key -> ${selectionKey}`);
      }
    },
    [] as T[]
  );
};

export function insertAt<T>(array: T[], index: number, newItem: T): T[] {
  return [
    ...array.slice(0, index),
    newItem,
    ...array.slice(index)
  ];
}
