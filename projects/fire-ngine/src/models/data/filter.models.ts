
export interface QueryFilter {
  name: string;
  property: string;
  value: string | boolean | any[] | null;
  range?: {
    min?: number;
    max?: number;
    exclusive?: boolean;
  }
  equality?: boolean | 'array' | 'in';
};
