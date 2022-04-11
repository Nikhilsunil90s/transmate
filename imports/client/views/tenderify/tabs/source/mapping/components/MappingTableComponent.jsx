import React, { useContext, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { useApolloClient, useMutation } from "@apollo/client";
import Grid from "/imports/client/components/grid/Grid";
import ValidRenderer from "./table/ValidRender";
import SettingsContext from "../../../../utils/settingsContext";
import { gridColToTypeDef } from "./table/gridColToTypeDef";
import ServiceRender from "/imports/client/views/tenderify/tabs/sheet/table/ServiceRender";
import { getContextMenuItems } from "./table/getContextMenuItems";
import { DUPLICATE_TENDER_BID_MAPPING_ROW } from "/imports/client/views/tenderify/utils/queries";
import { get } from "lodash";

const debug = require("debug")("tenderBid:mapping");

let gridApi;
let activeFilter = {};
const MappingTableComponent = ({
  data,
  colHeaders,
  afterChange,
  security,
  mappingId,
  topic,
  filters
}) => {
  const client = useApolloClient();
  const [duplicateMappingRow] = useMutation(DUPLICATE_TENDER_BID_MAPPING_ROW);
  const { mappingKeys, mapBlocks, mappingListOptions } = useContext(SettingsContext);
  const canEdit = true; // TODO: tie to access control
  activeFilter = filters;
  const columnDefs = useMemo(
    function buildColumns() {
      const headerRef = colHeaders || [];
      const columns = [];
      const leftCount = headerRef.filter(hdrStr => hdrStr.includes(mapBlocks[0]))?.length || 0;

      headerRef.forEach((header, hdrIndex) => {
        if (header === "id" || header === "targetId" || header === "originId") return;
        const [lr, key] = header.split("_");
        const col = mappingKeys.find(({ k }) => k === key) || {};

        const curCol = { type: [] };
        curCol.field = header;

        // format left columns as headers:
        if (lr === mapBlocks[0]) {
          curCol.type.push("static");
          curCol.filter = true;
        }

        // render a separator line:
        if (hdrIndex === leftCount) {
          curCol.cellClass = "leftBorder";
        }

        // if user can Edit & is target side:
        if (lr !== mapBlocks[0]) {
          // predefined list:
          gridColToTypeDef({ col, curCol, mappingListOptions, client });
          // editable on/off for edit columns
          if (canEdit) {
            curCol.type.push("editable");
          }
        }

        if (header === "validated") {
          curCol.type.push("validRenderer");
          curCol.type.push("static");
          curCol.headerName = header;

          columns.unshift(curCol); // to beginning
        } else {
          curCol.headerName = col.label || key || header;
          columns.push(curCol);
        }
      });
      return columns;
    },
    [colHeaders]
  );

  const onDuplicate = ({ row: rowData }) => {
    duplicateMappingRow({ variables: { input: { mappingId, topic, originId: rowData.originId } } });
  };

  useEffect(() => {
    if (!gridApi) return;
    debug("running filter %o", filters);
    gridApi.onFilterChanged();
  }, [filters]);

  const doesExternalFilterPass = ({ data: rowData }) => {
    // if key == false -> filter for that condition
    let c = false;
    c = (activeFilter.valid && rowData.validated) || (activeFilter.invalid && !rowData.validated);
    return c;
  };
  const isExternalFilterPresent = () => Object.keys(filters).length > 0;

  return (
    <Grid
      onGridReady={api => {
        gridApi = api;
      }}
      onFirstDataRendered={({ api, columnApi }) => {
        // determine empty columns
        const colsToHide = columnApi.getAllColumns().reduce((acc, { colId }) => {
          if (colId && colId.includes("origin_") && !data.some(row => get(row, colId))) {
            acc.push(colId);
          }
          return acc;
        }, []);
        columnApi.setColumnsVisible(colsToHide, false);
        columnApi.autoSizeAllColumns();
      }}
      defaultColDef={{ minWidth: null }}
      staticStyle={{ backgroundColor: "#F2F4F8", color: "#44546A" }}
      rowData={JSON.parse(JSON.stringify(data))}
      columnDefs={columnDefs}
      getContextMenuItems={params => getContextMenuItems({ params, topic, onDuplicate })}
      getRowNodeId={row => row.originId} // needed for immutable data
      afterChange={afterChange}
      columnTypes={{
        validRenderer: {
          cellRendererFramework: ValidRenderer
        },
        serviceRender: {
          cellRendererFramework: ServiceRender
        }
      }}
      isExternalFilterPresent={isExternalFilterPresent}
      doesExternalFilterPass={doesExternalFilterPass}
      context={{ security, client }}
    />
  );
};

MappingTableComponent.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  colHeaders: PropTypes.arrayOf(PropTypes.string),
  afterChange: PropTypes.func,
  security: PropTypes.object,
  mappingId: PropTypes.string,
  topic: PropTypes.string,
  filters: PropTypes.shape({
    valid: PropTypes.bool,
    invalid: PropTypes.bool
  })
};

export default MappingTableComponent;
