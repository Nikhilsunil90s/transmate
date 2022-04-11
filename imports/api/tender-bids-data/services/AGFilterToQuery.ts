export interface AGFilterModelItemMap {
  key: string;
  filterType: string;
  values?: string[];
  type?: string;
  filter?: string | number;
  filterTo?: string | number;
}

export const AGFilterToQuery = (
  filters: AGFilterModelItemMap[] = []
): Object => {
  return filters.reduce((acc, { key, filterType, values }) => {
    if (filterType === "set") {
      acc[`${key}.mapping`] = { $in: values || [] };
    }
    return acc;
  }, {});
};
