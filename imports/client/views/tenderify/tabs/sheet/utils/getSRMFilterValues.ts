import { SetFilterValuesFuncParams } from "@ag-grid-community/core";

export const getSRMFilterValues = (
  params: SetFilterValuesFuncParams,
  getValues: (key: string, onSuccess: (values: string[]) => void) => void
) => {
  const { field } = params.colDef;
  const rootKey = field.replace("rowData.", "");
  getValues(rootKey, params.success);
};
