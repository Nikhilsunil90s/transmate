import {
  GetContextMenuItemsParams,
  MenuItemDef
} from "@ag-grid-community/core";

type MenuItemType = string | MenuItemDef;

export const getContextMenuItems = (
  params: GetContextMenuItemsParams
): MenuItemType[] => {
  const { onGetDataFromPriceList } = params.context;

  // FIXME: only on calculation columns??
  const isColumnEdible = params.column.getColDef()?.editable;
  const result = [
    ...(isColumnEdible
      ? [
          {
            name: "Get Data from:",
            subMenu: [
              {
                name: "Price list",
                async action() {
                  // important: grid should have suppressRowClickSelection=false & rowSelection="multiple" options
                  const rowData = params.api.getSelectedRows();
                  const lineIds = rowData.map(({ lineId }) => lineId);
                  onGetDataFromPriceList({ lineIds });
                },
                icon: "<i class='ui list icon'></i>"
              },
              {
                name: "API",
                disabled: true,
                action() {
                  alert("no api call connected");
                },
                icon: "<i class='ui download icon'></i>"
              },
              {
                name: "Add to tender",
                disabled: true,
                action() {
                  alert("Add items to tender");
                },
                icon: "<i class='ui gavel icon'></i>"
              }
            ]
          },
          "separator"
        ]
      : []),

    "copy",
    "copyWithHeaders",
    "excelExport",
    "separator",
    // "contractAll",
    // "expandAll",
    "autoSizeAll"
  ];
  return result;
};
