import React from "react";
import FooterBar from "./FooterBar";

const PaginationFooter = props => {
  const { PaginationComponent, PaginationSummaryComponent } = props;

  return (
    <FooterBar>
      <div>{props.children}</div>

      <div className="dataTables_paginate paging_simple_numbers pages">{PaginationComponent}</div>

      <div className="dataTables_info status">{PaginationSummaryComponent}</div>
    </FooterBar>
  );
};

export default PaginationFooter;
