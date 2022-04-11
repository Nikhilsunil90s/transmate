import { GetMainMenuItemsParams, MenuItemDef } from "@ag-grid-community/core";

type MenuItemType = string | MenuItemDef;

export function getMainMenuItems(
  params: GetMainMenuItemsParams
): MenuItemType[] {
  const { defaultItems, context } = params;
  const menuItems: MenuItemType[] = defaultItems;

  if (context.security?.editUBS) {
    menuItems.push("separator");
    menuItems.push({
      name: "Insert calculation column",
      action: function() {
        if (typeof context.onAddNewColumn === "function") {
          context.onAddNewColumn();
        }
      }
    });
  }
  return menuItems;
}
