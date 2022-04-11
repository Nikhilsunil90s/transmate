export const getContextMenuItems = ({ params, topic, onDuplicate }) => {
  const { security } = params.context;
  const rowData = params.node.data || {};
  const result = [
    {
      name: "Duplicate row",
      disabled: security.editMapping && ["charges"].includes(topic),
      icon: "<i class='ui clone outline icon'></i>",
      action() {
        onDuplicate({ row: rowData });
      }
    },
    "separator",
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
