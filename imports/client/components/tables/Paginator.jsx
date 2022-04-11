import React from "react";
import { Pagination } from "semantic-ui-react";

const Paginator = props => {
  const { rowCount, defaultActivePage, totalPages, onPageChange } = props;

  const shouldShowPagination = rowCount > 0;

  if (!shouldShowPagination) {
    return null;
  }

  return (
    <Pagination
      firstItem={null}
      lastItem={null}
      nextItem={{ "aria-label": "Next item", content: "Next" }}
      prevItem={{ "aria-label": "Next item", content: "Previous" }}
      defaultActivePage={defaultActivePage}
      totalPages={totalPages}
      onPageChange={(_, { activePage }) => onPageChange(activePage)}
    />
  );
};

export default Paginator;
