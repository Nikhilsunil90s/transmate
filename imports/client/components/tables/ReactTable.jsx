/* eslint-disable react-hooks/rules-of-hooks */
import React, { useMemo, useEffect } from "react";
import { oneOfType, string, shape, element, object, bool, func, arrayOf, number } from "prop-types";
import { useTable, useSortBy, usePagination, useExpanded } from "react-table";
import { useExportData } from "react-table-plugins";
import classNames from "classnames";
import get from "lodash.get";

import PaginationSummary from "../tables/PaginationSummary";
import { Loading } from "../progress";
import { PaginationFooter } from "../footer";
import Paginator from "./Paginator";

import useSelectable from "./hooks/useSelectable";
import prepareSelectedRows from "./utils/prepareSelectedRows";
import { getExportFileBlob, loadExcelJS } from "./utils/exportData";

const debug = require("debug")("react-table");

const DEFAULT_MAX_ROWS = 10;

// Create a default prop getter
const defaultPropGetter = () => ({});

let onExportData;

// todo use context to store props
const ReactTable = props => {
  const {
    data,
    emptyTableMsg,
    columns,
    paginate,
    isExpandable,
    renderRowSubComponent, // custom render for subrows
    TheadComponent, // override thead
    quantifier,
    resultLength,
    onRowClicked,
    maxRows,
    initialState = {},
    fetchData,
    fetchTriggers = [],
    onSelectedRows,
    isLoading,
    selectorKey,
    shouldShowFooterPagination,
    shouldShowTablePagination,
    shouldShowTableFooter,
    paginationContent,
    getTableActions,
    tableClass,
    windowEvaluation,
    getCellProps = defaultPropGetter,
    getColumnProps = defaultPropGetter,
    getHeaderProps = defaultPropGetter
  } = props;
  ({ onExportData } = props);

  const refinedColumns = useMemo(() => columns, [columns]);
  const refinedData = useMemo(() => data, [data]);

  const manualPagination = typeof fetchData === "function";
  const isSelectable = typeof onSelectedRows === "function";
  const isFooterPaginationVisible = paginate && !isLoading && shouldShowFooterPagination;
  const isTablePaginationVisible = paginate && !isLoading && shouldShowTablePagination;
  const plugins = [useSortBy];
  if (paginate) plugins.push(usePagination);
  if (isSelectable) plugins.push(useSelectable);
  if (isExpandable) plugins.push(useExpanded);
  if (onExportData) plugins.push(useExportData);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    footerGroups,
    rows,
    page,
    prepareRow,
    visibleColumns,
    setPageSize,
    gotoPage,
    exportData,
    state: { pageIndex, pageSize, sortBy, selectedRowIds, expanded }
  } = useTable(
    {
      initialState: { pageSize: maxRows, ...initialState },
      columns: refinedColumns,
      data: refinedData,
      manualSortBy: manualPagination,
      manualPagination,
      ...(manualPagination ? { pageCount: Math.ceil(resultLength / maxRows) } : {}),
      ...(onExportData ? { getExportFileBlob } : {})
    },
    ...plugins
  );

  if (getTableActions) getTableActions({ gotoPage });
  if (onExportData) onExportData(() => exportData("xlsx", true));
  if (onExportData) {
    // will add exceljs script to the window
    useEffect(() => loadExcelJS(), []);
  }

  const shouldShowRows = !paginate;
  const activeRows = shouldShowRows ? rows : page;
  const currentPage = pageIndex + 1;
  const rowCount = resultLength || rows.length;
  const totalPages = Math.ceil(rowCount / pageSize);
  const tableProps = getTableProps();
  const tableBodyProps = getTableBodyProps();

  useEffect(() => {
    const shouldSetPageSize = typeof setPageSize === "function" && maxRows;

    if (shouldSetPageSize) {
      setPageSize(maxRows);
    }
  }, [maxRows]);

  function handleFetchResultWithPagination() {
    if (manualPagination) fetchData({ pageSize, pageIndex, maxRows, sortBy });
  }

  function handleSelectedRowsChanged() {
    if (isSelectable && !isLoading) {
      const selectedRows = prepareSelectedRows({ selectedRowIds, rows, selectorKey });
      onSelectedRows(selectedRows, selectedRowIds);
    }
  }

  function handleChangePage(pageNumber) {
    const newPageIndex = pageNumber - 1;
    debug("going to page", newPageIndex);
    gotoPage(newPageIndex);
  }

  const PaginationComponent = (
    <Paginator
      rowCount={rowCount}
      defaultActivePage={currentPage}
      totalPages={totalPages}
      onPageChange={handleChangePage}
    />
  );

  const PaginationSummaryComponent = (
    <PaginationSummary
      rowCount={rowCount}
      currentPage={currentPage}
      rowsPerPage={pageSize}
      quantifier={quantifier}
    />
  );

  useEffect(() => {
    if (windowEvaluation > -4) {
      handleFetchResultWithPagination();
    }
  }, [pageIndex, sortBy, ...fetchTriggers, windowEvaluation]);
  useEffect(() => handleSelectedRowsChanged(), [selectedRowIds]);

  return (
    <Loading isLoading={isLoading}>
      <table className={tableClass || "dataTable"} {...tableProps}>
        {TheadComponent ? (
          <TheadComponent />
        ) : (
          <TableHeader
            headerGroups={headerGroups}
            getColumnProps={getColumnProps}
            getHeaderProps={getHeaderProps}
          />
        )}

        {!isLoading && (
          <TableBody
            rows={activeRows}
            prepareRow={prepareRow}
            tableBodyProps={tableBodyProps}
            onRowClicked={onRowClicked}
            getCellProps={getCellProps}
            getColumnProps={getColumnProps}
            visibleColumns={visibleColumns}
            expanded={expanded}
            renderRowSubComponent={renderRowSubComponent}
            emptyTableMsg={emptyTableMsg}
          />
        )}

        {/* simple Footer: */}
        {!isLoading && shouldShowTableFooter && <TableFooter footerGroups={footerGroups} />}

        {/* Pagination footer */}
        {isTablePaginationVisible && !shouldShowTableFooter && (
          <tfoot className="full-width">
            <tr colSpan="100">
              <td colSpan="100">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignContent: "center",
                    alignItems: "center"
                  }}
                >
                  <div>{PaginationComponent}</div>
                  <div>{PaginationSummaryComponent}</div>
                </div>
              </td>
            </tr>
          </tfoot>
        )}
      </table>

      {isFooterPaginationVisible && (
        <PaginationFooter
          quantifier={quantifier}
          onPageChange={handleChangePage}
          rowCount={rowCount}
          rowsPerPage={pageSize}
          currentPage={currentPage}
          totalPages={totalPages}
          PaginationComponent={PaginationComponent}
          PaginationSummaryComponent={PaginationSummaryComponent}
        >
          {paginationContent}
        </PaginationFooter>
      )}
    </Loading>
  );
};

const TableHeader = props => {
  const { headerGroups, getColumnProps, getHeaderProps } = props;

  return (
    <thead>
      {headerGroups.map((headerGroup, headerGroupIndex) => {
        const headerGroupProps = headerGroup.getHeaderGroupProps();

        return (
          <tr key={headerGroupIndex} {...headerGroupProps}>
            {headerGroup.headers.map((column = {}, index) => {
              const isColumnSorted = column.isSorted;

              const hasSortToggleProps = typeof column.getSortByToggleProps === "function";
              const columnSortProps = hasSortToggleProps ? column.getSortByToggleProps() : {};
              const columnHeaderProps = {
                ...column.getHeaderProps([
                  {
                    className: column.className,
                    style: column.style,
                    ...columnSortProps
                  },
                  getColumnProps(column),
                  getHeaderProps(column)
                ])
              };

              return (
                <th
                  key={index}
                  className={classNames({ sorting: isColumnSorted })}
                  {...columnHeaderProps}
                >
                  {column.render("Header")}
                </th>
              );
            })}
          </tr>
        );
      })}
    </thead>
  );
};

const TableBody = props => {
  const {
    rows,
    prepareRow,
    tableBodyProps,
    onRowClicked,
    getCellProps,
    getColumnProps,
    visibleColumns,
    renderRowSubComponent,
    emptyTableMsg
  } = props;

  const hasRowClickFunction = onRowClicked && typeof onRowClicked === "function";
  const rowClickFunction = hasRowClickFunction ? onRowClicked : () => {};

  const hasRows = Array.isArray(rows) && rows.length > 0;

  if (!hasRows) {
    return (
      <tbody>
        <tr>
          <td colSpan="100" className="dataTables_empty" valign="top">
            <div className="empty">{emptyTableMsg || "No data available in table"}</div>
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody {...tableBodyProps}>
      {rows.map((row = {}, index) => {
        prepareRow(row);
        const rowProps = row.getRowProps();

        return (
          <React.Fragment key={index}>
            <tr {...rowProps} onClick={() => rowClickFunction(row.original, row.index)}>
              {row.cells.map(cell => {
                const cellProps = {
                  ...cell.getCellProps([
                    {
                      className: get(cell, ["column", "className"]),
                      style: get(cell, ["column", "style"])
                    },
                    getColumnProps(cell.column),
                    getCellProps(cell)
                  ])
                };

                return (
                  <td key={index} {...cellProps}>
                    {cell.render("Cell")}
                  </td>
                );
              })}
            </tr>
            {row.isExpanded && typeof renderRowSubComponent === "function" ? (
              <tr>{renderRowSubComponent({ row, colSpan: visibleColumns.length })}</tr>
            ) : null}
          </React.Fragment>
        );
      })}
    </tbody>
  );
};

/** generates a table footer (! not the pagination footer)  */
const TableFooter = props => {
  const { footerGroups } = props;

  return (
    <tfoot>
      {footerGroups.map((group, footerGroupIndex) => (
        <tr key={footerGroupIndex} {...group.getFooterGroupProps()}>
          {group.headers.map((column, index) => (
            <td key={index} {...column.getFooterProps()}>
              {column.render("Footer")}
            </td>
          ))}
        </tr>
      ))}
    </tfoot>
  );
};

ReactTable.propTypes = {
  columns: arrayOf(
    shape({
      Header: oneOfType([string, element, number, func]),
      accessor: (props, propName, componentName) => {
        if (!props.accessor && !props.id) {
          return new Error(
            `One of props 'accessor' or 'id' was not specified in '${componentName}'.`
          );
        }
        return null;
      },
      id: (props, propName, componentName) => {
        if (!props.accessor && !props.id) {
          return new Error(
            `One of props 'accessor' or 'id' was not specified in '${componentName}'.`
          );
        }
        return null;
      },
      className: string,
      Cell: func
    })
  ),
  data: arrayOf(object),
  emptyTableMsg: oneOfType([string, element]),
  initialState: shape({
    pageIndex: number,
    expanded: object,
    hiddenColumns: arrayOf(string)
  }),
  isExpandable: bool,
  paginate: bool,
  isLoading: bool,
  shouldShowFooterPagination: bool,
  shouldShowTablePagination: bool,
  resultLength: number,
  maxRows: number,
  paginationContent: element,
  renderRowSubComponent: func,
  onRowClicked: func,
  onSelectedRows: func,
  fetchData: func,
  getCellProps: func,
  quantifier: string,
  tableClass: string,
  onExportData: func
};

ReactTable.defaultProps = {
  maxRows: DEFAULT_MAX_ROWS
};

export default ReactTable;
