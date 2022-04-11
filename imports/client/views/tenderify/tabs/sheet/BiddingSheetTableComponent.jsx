import React, { useContext, useMemo, useState, useEffect } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { useApolloClient, useMutation } from "@apollo/client";
import Grid from "/imports/client/components/grid/Grid";
import ServiceRender from "./table/ServiceRender";

import { gridColToTypeDef } from "./table/gridColToTypeDef";
import { getContextMenuItems } from "./table/getContextMenuItems";
import { getMainMenuItems } from "./table/getMainMenuItems";
import {
  UPDATE_TENDER_BID_DATA_GRID,
  GENERATE_GRID_DATA_FROM_PRICELIST,
  RESET_GRID_DATA,
  GET_FILTER_VALUES,
  INSERT_CALCULATION_COLUMN
} from "./utils/queries";
import { tabProptypes } from "../../utils/propTypes";
import { getSRMFilterValues } from "./utils/getSRMFilterValues";
import { PriceListSelectModal } from "/imports/client/components/modals";
import InsertNewColumnModal from "./modals/InsertNewColumnModal";
import LoginContext from "/imports/client/context/loginContext";
import SettingsContext from "/imports/client/views/tenderify/utils/settingsContext";
import useRoute from "/imports/client/router/useRoute";
import { Emitter, Events } from "/imports/client/services/events";
import { fillOutCell } from "./table/fillOutCell";
import { simpleCalculationCell } from "./table/simpleCalculationCell";
import { CALCULATION_CELL_STYLE, FOLDING_GROUPS } from "./utils/enums";
const debug = require("debug")("tenderify.mapping");

function colGroupHeader(colGroup) {
  const label = (colGroup || "").split("-").slice(-1)?.[0];
  return label.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

let initialized;
let gridApi;
const BiddingSheetTableComponent = props => {
  const client = useApolloClient();
  const { setQueryParams, queryParams: initialFilter } = useRoute();
  const { accountId } = useContext(LoginContext);
  const { mappingKeys, mappingListOptions } = useContext(SettingsContext);

  const [dataFromPLState, setDataFromPLState] = useState({ show: false });
  const [newColumnState, setNewColumnState] = useState({ show: false });

  const [generateDataFromPriceList] = useMutation(GENERATE_GRID_DATA_FROM_PRICELIST, {
    onCompleted() {
      setDataFromPLState({ show: false, lineIds: [] });
    },
    onError(error) {
      console.error(error);
      toast.error("Could not get data");
    }
  });
  const [resetGridData] = useMutation(RESET_GRID_DATA, {
    onError(error) {
      console.error(error);
      toast.error("Could not get data");
    },
    onCompleted() {
      gridApi.refreshServerSideStore();
    }
  });
  const [updateGridData] = useMutation(UPDATE_TENDER_BID_DATA_GRID, {
    onCompleted(data) {
      toast.success("Changes stored");
    },
    onError(error) {
      console.error({ error });
      toast.error("Could not save changes");
    }
  });

  const {
    headerDefs,
    tenderBidId,
    security,
    rowModelType,
    serverSideDatasource,
    pagination,
    paginationPageSize,
    serverSideStoreType,
    cacheBlockSize
  } = props;
  const canEdit = true;

  const handleChange = updates => {
    // change can be:
    // fill-out cell (type: fillOutCell) -> capture either formula OR value (value + currency?)
    // calculation (type "calculationCharge") -> capture value (value + currency?)
    const processedUpdate = updates.map(({ colDef, data, newValue, oldValue }) => {
      const def = headerDefs.find(({ cKey }) => cKey === colDef.field.replace("rowData.", ""));
      return {
        colKey: def ? def.dataKey : colDef.field,
        cType: def ? def.cType : null,
        lineId: data.lineId,
        newValue, // either string OR {amount:{}, formula,...}
        oldValue
      };
    });

    updateGridData({ variables: { input: { tenderBidId, updates: processedUpdate } } }).then(
      ({ data }) => {
        const updatedData = data?.updateTenderBidDataGrid || [];

        // update the grid rows with the return values of the mutation:
        updatedData.forEach(({ lineId, tenderBidId, rowData }) => {
          const rowNode = gridApi.getRowNode(lineId);
          if (rowNode) {
            rowNode.setData({ lineId, tenderBidId, rowData });
          }
        });
      }
    );
  };

  const getFilterValues = (key, onSuccessCb) => {
    client
      .query({
        query: GET_FILTER_VALUES,
        variables: { input: { tenderBidId, key } },
        fetchPolicy: "no-cache"
      })
      .then(({ data }) => {
        onSuccessCb(data?.filterValues?.values || []);
      })
      .catch(error => {
        console.error({ error });
      });
  };

  const insertNewCalculationColumn = ({
    name: newColumnName,
    key: newColumnKey,
    defaultValue,
    operation,
    refColumn
  }) => {
    client
      .mutate({
        mutation: INSERT_CALCULATION_COLUMN,
        variables: {
          input: {
            tenderBidId,
            newColumnName,
            newColumnKey,
            defaultValue,

            // add to bidColumn value
            operation, // add | multiply | none
            refColumn
            // filters: // active filters or selected rows (lineIds)
          }
        }
      })
      .then(() => {
        toast.success("Column added");
        setNewColumnState({ show: false });
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not insert calculation column.");
      });
  };

  const columnDefs = useMemo(function buildStructure() {
    // 1. object keys -> unified header object
    // 2. order for rendering
    // 3. get out header array for representation
    // 4. get out columns array for data viewing

    //#region colMap
    const cols = headerDefs.map(col => {
      const curCol = {
        ...mappingKeys.find(rf => rf.k === col.key),
        ...col
      };

      switch (true) {
        case ["fillOut", "calculationCharge", "calculationField"].includes(col.cType) || col.edit:
          curCol.type = canEdit ? ["editable"] : [];
          break;
        case col.cType === "statistics":
          curCol.type = ["static"];
          break;
        case col.cType === "col":
        default:
          curCol.type = ["static"];
          curCol.filter = true;
      }

      gridColToTypeDef({ curCol, mappingListOptions });
      return curCol;
    });

    //#endregion

    // grouped columns:
    const defs = cols.reduce((acc, col) => {
      const toFold = FOLDING_GROUPS.includes(col.group);
      const grp = acc[col.group] || {
        headerName: colGroupHeader(col.group),
        ...(toFold ? { openByDefault: false } : {}),
        children: []
      };
      grp.children.push({
        ...{
          field: `rowData.${col.cKey}`,
          headerName: col.label,
          type: col.type,
          filter: col.filter,
          filterParams: { values: params => getSRMFilterValues(params, getFilterValues) },

          // required to ensure that the cellEditor of the type is used if it exists!
          ...(col.cellEditor
            ? { cellEditor: col.cellEditor, cellEditorParams: col.cellEditorParams }
            : {}),
          ...(toFold ? { columnGroupShow: col.isFoldKey ? "closed" : "open" } : {})
        }
      });
      return { ...acc, [col.group]: grp };
    }, {});
    return Object.values(defs);
  }, []);

  const onGetDataFromPriceList = ({ lineIds }) => {
    setDataFromPLState({ show: true, lineIds });
  };

  // calculate for selected ranges. (right click in menu > calculates for these lineIds)
  const getDataFromPriceList = ({ priceListId }) => {
    const { lineIds = [] } = dataFromPLState;
    debug("getting data from priceList %s", priceListId);
    toast.info(`Getting data for ${lineIds.length} rows from priceList`);
    generateDataFromPriceList({
      variables: { input: { tenderBidId, lineIds, priceListId } }
    });
  };

  // calculate overall, based on filtering
  // we retrieve the filters first and call the mutation next
  useEffect(() => {
    Emitter.on(Events.CALCULATE_TENDER_BID, ({ action }) => {
      const lineIds = [];

      // TODO: get filter model and pass that to the server
      // if (gridApi.isAnyFilterPresent()) {
      //   gridApi.forEachNodeAfterFilter(({ data }) => lineIds.push(data.lineId));
      //   debug("lineIds", lineIds);
      // }
      switch (action) {
        case "calculate":
          toast.info(`Running calculations on ${lineIds.length ? lineIds.length : "all"} rows`);
          generateDataFromPriceList({
            variables: { input: { tenderBidId, lineIds } }
          });
          break;
        case "reset":
          toast.info(`Resetting ${lineIds.length ? lineIds.length : "all"} rows`);
          resetGridData({
            variables: { input: { tenderBidId, lineIds } }
          });
          break;
        default:
          toast.error("Could not perform action");
      }
    });
    return () => Emitter.off(Events.CALCULATE_TENDER_BID);
  }, []);

  return (
    <>
      <Grid
        serverSideStoreType={serverSideStoreType}
        pagination={pagination}
        paginationPageSize={paginationPageSize}
        cacheBlockSize={cacheBlockSize}
        rowModelType={rowModelType}
        defaultColDef={{ minWidth: null, enableFillHandle: true, enableRangeHandle: true }}
        columnDefs={columnDefs}
        getMainMenuItems={getMainMenuItems}
        getContextMenuItems={getContextMenuItems}
        staticStyle={{ backgroundColor: "#F2F4F8", color: "#44546A" }}
        getRowNodeId={row => row.lineId}
        afterChange={handleChange} // onCellValueChanged?
        columnTypes={{
          serviceRender: {
            cellRendererFramework: ServiceRender
          },

          // cell that is calculation but no charge:
          calculationCell: {
            cellStyle: CALCULATION_CELL_STYLE
          },

          fillOutCell,
          simpleCalculationCell
        }}
        context={{
          security,
          client,
          tenderBidId,
          onGetDataFromPriceList,
          onAddNewColumn: () => setNewColumnState({ ...newColumnState, show: true })
        }}
        onGridReady={api => {
          gridApi = api;
          if (serverSideDatasource) {
            api.setServerSideDatasource(serverSideDatasource);
          }
          if (Object.keys(initialFilter) && !initialized) {
            const model = Object.entries(initialFilter).reduce((acc, [k, v]) => {
              acc[`rowData.${k}`] = {
                filterType: "set",
                values: v.split(",")
              };
              return acc;
            }, {});

            api.setFilterModel(model);
          }
          initialized = true;
        }}
        sideBar={{ toolPanels: ["filters"] }}
        // used to get filtered params to the url params:
        onFilterChanged={({ api }) => {
          const filterModel = api.getFilterModel();

          if (Object.keys(filterModel).length) {
            const queryParams = Object.entries(filterModel).reduce((acc, [k, v]) => {
              const key = k.replace("rowData.", "");
              acc[key] = v.values;
              return acc;
            }, {});
            setQueryParams(queryParams, true);
          } else {
            setQueryParams({});
          }
        }}
      />
      <PriceListSelectModal
        show={dataFromPLState.show}
        showModal={show => setDataFromPLState({ ...dataFromPLState, show })}
        onSave={getDataFromPriceList}
        query={{ carrierId: accountId, type: "contract" }}
      />
      <InsertNewColumnModal
        show={newColumnState.show}
        showModal={show => setNewColumnState({ ...newColumnState, show })}
        onSave={insertNewCalculationColumn}
        existingCalculationColumns={headerDefs
          .filter(({ cType }) => cType === "calculationCharge")
          .map(({ dataKey }) => dataKey.split(".").slice(-1)[0])}
        availableBidColumns={headerDefs
          .filter(({ cType, key }) => cType === "fillOut" && key === "chargeDescription")
          .map(({ dataKey, label }) => ({ dataKey, label }))}
      />
    </>
  );
};

BiddingSheetTableComponent.propTypes = {
  ...tabProptypes,
  meta: PropTypes.object,
  dataSource: PropTypes.object
};

export default BiddingSheetTableComponent;
