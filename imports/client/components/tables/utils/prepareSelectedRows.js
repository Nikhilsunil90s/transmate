const prepareSelectedRows = ({ selectedRowIds = [], rows, selectorKey }) => {
  const flatSelectedRows = [];
  const selectedRows = Object.keys(selectedRowIds);

  selectedRows.forEach(selectedRow => {
    const isSelected = selectedRowIds[selectedRow];

    if (isSelected) {
      const selectedRowData = rows[selectedRow] || {};
      const originalData = selectedRowData.original || {};

      flatSelectedRows.push(
        selectorKey ? originalData[selectorKey] : originalData
      );
    }
  });

  return flatSelectedRows;
};

export default prepareSelectedRows;

// const sampleSelectedRowIds = { 0: true, 1: false, 2: true, 5: true };

// const selectedRows = prepareSelectedRows({
//   selectedRowIds: sampleSelectedRowIds,
//   rows,
//   selectorKey: "id"
// });
// debug("selectedRows", selectedRows);
