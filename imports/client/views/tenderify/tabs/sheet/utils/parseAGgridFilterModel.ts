interface FilterModelItem {
  filterType: string;
  values?: string[];
  type?: string;
  filter?: string | number;
  filterTo?: string | number;
}
interface FilterModel {
  [key: string]: FilterModelItem;
}

interface FilterModelMap extends FilterModelItem {
  key: string;
}

export const parseFilterModel = (
  filterModel: FilterModel
): FilterModelMap[] => {
  return Object.entries(filterModel).map(
    ([k, { filterType, values, type, filter, filterTo }]) => ({
      key: k.replace("rowData.", ""),
      filterType,
      values,
      type,
      filter,
      filterTo
    })
  );
};
