const portColumnsFromOldDatatable = (columns = []) => {
  return columns.map((column = {}) => {
    const { title: Header, data } = column || {};

    // strip off all "shipment." prefix from data
    // const accessor = data.replace(/^shipment./i, "");

    return { Header, accessor: data };
  });
};

export default portColumnsFromOldDatatable;
