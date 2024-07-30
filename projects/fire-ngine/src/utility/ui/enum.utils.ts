import { SelectOption } from "..";

export const getEnumOptions: <T extends object>(enumType: T) => SelectOption[] = (enumType) => {
  return Object.keys(enumType)
    .map((name) => {
      return {
        name,
        value: enumType[name as keyof typeof enumType],
      } as unknown as SelectOption;
    });
}

export const getNumberEnumOptions: <T extends object>(enumType: T) => SelectOption[] = (enumType) => {
  return Object.values(enumType)
    .filter(value => typeof value === 'number')
    .map((value) => {
      return {
        name: enumType[value as keyof typeof enumType],
        value,
      } as unknown as SelectOption;
    });
}

export const getArrayOptions: (options: string[]) => SelectOption[] = (options) => {
  return options.map(
    option => ({
      name: option,
      value: option
    })
  );
}

export const getEnumArrayOptions: <T extends object>(enumType: T, options: string[]) => SelectOption[] = (enumType, options) => {
  return getEnumOptions(enumType)
    .filter(
      (option) => options.includes(option.value)
    );
}

// string-string enums
export const getDisplayName: <T extends object>(enumType: T, value?: string | number | null) => string = (enumType, value) => {
  const name = Object.entries(enumType).find(([key, val]) => val === value)?.[0];

  if (!!name) {
    return name;
  } else {
    return '';
  }
}
