import React from "react";

const PaginationSummary = props => {
  const { rowCount, currentPage, rowsPerPage, quantifier = "items" } = props;

  const firstPage = (currentPage - 1) * rowsPerPage + 1;
  let lastPage = currentPage * rowsPerPage;
  lastPage = lastPage > rowCount ? rowCount : lastPage;

  const shouldShowPagination = rowCount > 0;

  if (!shouldShowPagination) {
    return null;
  }

  return <p>{`Showing ${firstPage}-${lastPage} of ${rowCount} ${quantifier}`}</p>;
};

export default PaginationSummary;
