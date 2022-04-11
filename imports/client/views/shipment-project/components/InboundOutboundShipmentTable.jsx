import { toast } from "react-toastify";
import { useApolloClient, useMutation } from "@apollo/client";
import React, { useState, useEffect, useContext } from "react";
import getNested from "lodash.get";

// import mergeObjects from "lodash.merge";
// import dot from "dot-object";
import { Button, Icon, Popup } from "semantic-ui-react";

import { ReactTable } from "/imports/client/components/tables";
import {
  StatusTag,
  CurrencyTag,
  ModeTag,
  DateTag,
  TimeTag,
  ItemEquipmentRefTag
} from "/imports/client/components/tags";
import { ShipmentStatusTableCell, ShipmentDateTableCell } from ".";
import LoginContext from "/imports/client/context/loginContext";
import { getContrastYIQ } from "/imports/utils/functions/fnStyleHelpers";
import { REMOVE_EXISTING_SHIPMENT_FROM_PROJECT, DUPLICATE_SHIPMENT } from "../utils/queries";
import {
  formatCarrier,
  formatShipper,
  formatCooling,
  formatDateType,
  dateFormatter,
  timeFormatter,
  timeZoneFormatter,
  locationFormatter,
  locationNameFormatter,
  itemFormatter,
  equipmentFormatter
} from "./exportFormatters";
import useRoute from "/imports/client/router/useRoute";
import { generateRoutePath } from "/imports/client/router/routes-helpers";
import { ConfirmComponent } from "/imports/client/components/modals";

const debug = require("debug")("project:UI");

const InboundOutboundShipmentTable = ({
  type,
  projectId,
  shipments = [],
  keys = {},
  canEdit,
  onExportData,
  refetch
}) => {
  const { goRoute } = useRoute();
  const client = useApolloClient();
  const { accountId, entities = [] } = useContext(LoginContext);
  const [data, setData] = useState([]);
  const [confirmData, setConfirm] = useState({ show: false, shipmentId: null, content: null });
  const [removeExistingShipmentFromProject] = useMutation(REMOVE_EXISTING_SHIPMENT_FROM_PROJECT, {
    onCompleted: (dataRes = {}) => {
      if (!dataRes.removeExistingShipmentFromProject) throw new Error("No confirmation returned");
      toast.success("Successfully removed shipment");
      refetch();
      setConfirm({ show: false });
    },
    onError: err => {
      console.error(err);
      toast.error("Shipment not removed");
    }
  });
  const userCanCreateShipment = canEdit;
  const userCanDetachShipment = canEdit && type === "OUTBOUND";

  useEffect(() => {
    setData([...shipments]);
    return () => setData([]);
  }, [shipments]);

  const canEditThisShipment = shipment =>
    shipment.accountId === accountId &&
    (!shipment.costParams?.entity || entities.includes(shipment.costParams.entity));

  const duplicateShipment = ({ shipmentId }) => {
    client
      .mutate({
        mutation: DUPLICATE_SHIPMENT,
        variables: {
          input: {
            shipmentId,
            options: { keepDates: true }
          }
        }
      })
      .then(({ errors, data: mutationData = {} }) => {
        if (errors) throw errors;
        debug("duplicate shipment %o", { old: shipmentId, new: mutationData });
        const { newShipmentId } = mutationData;
        if (!newShipmentId) throw new Error("no shipmentId");
        goRoute("shipment", { _id: newShipmentId });
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not copy shipment");
      });
  };

  const onConfirmUnlink = () => {
    const { shipmentId } = confirmData;
    removeExistingShipmentFromProject({
      variables: {
        input: { shipmentId, projectId, type }
      }
    });
  };

  return (
    <div className="shipment-inbound-outbound_wrapper">
      <ReactTable
        sortable
        data={data}
        tableClass="ui single line table"
        getCellProps={cell => {
          if (typeof cell.column.setStyle === "function") {
            return cell.column.setStyle(cell.row.original);
          }
          return {};
        }}
        columns={[
          {
            Header: "",
            accessor: keys.ID,
            disableExport: true,
            Cell: ({ row: { original: shipment = {} } }) => {
              return (
                <Button.Group basic>
                  <Button
                    as="a"
                    icon="share square"
                    href={generateRoutePath("shipment", {
                      _id: shipment.id
                    })}
                  />
                  {userCanCreateShipment && (
                    <Popup
                      content={`You can not copy this shipment: Missing entity role. (${shipment
                        .costParams?.entity || " - "})`}
                      disabled={canEditThisShipment(shipment)}
                      trigger={
                        <span>
                          <Button
                            icon="copy outline"
                            disabled={!canEditThisShipment(shipment)}
                            onClick={() => {
                              duplicateShipment({
                                shipmentId: shipment.id
                              });
                            }}
                          />
                        </span>
                      }
                    />
                  )}
                  {userCanDetachShipment && (
                    <Popup
                      content={`You can not detach this shipment: Missing entity role. (${shipment
                        .costParams?.entity || " - "})`}
                      disabled={canEditThisShipment(shipment)}
                      trigger={
                        <span>
                          <Button
                            icon="unlink"
                            disabled={!canEditThisShipment(shipment) && !!shipment.id}
                            onClick={() => {
                              setConfirm({
                                show: true,
                                shipmentId: shipment.id,
                                content: `Are you sure you want to unlink shipment ${shipment.number}?`
                              });
                            }}
                          />
                        </span>
                      }
                    />
                  )}
                </Button.Group>
              );
            }
          },
          {
            Header: "Status",
            accessor: keys.STATUS,
            Cell: ({ value }) => <ShipmentStatusTableCell status={value} />
          },
          {
            Header: "Ref.#",
            accessor: keys.REF_NO
          },
          {
            Header: "Carrier",
            accessor: keys.CARRIER, // {}
            getCellExportValue: ({ original }) => {
              return formatCarrier(original.carrier || {});
            },
            sortType: (row1, row2) => {
              return (
                getNested(row1, "original.carrier.annotation.coding.ediId") ||
                getNested(row1, "original.carrier.name") ||
                getNested(row1, "original.carrier._id", "")
              ).localeCompare(
                getNested(row2, "original.carrier.annotation.coding.ediId") ||
                  getNested(row2, "original.carrier.name") ||
                  getNested(row2, "original.carrier._id", "")
              );
            },
            Cell: ({ value }) => {
              return formatCarrier(value || {});
            },
            setStyle: rowInfo => {
              const props = {};
              const hexColor = getNested(rowInfo, ["carrier", "annotation", "coding", "color"]);
              if (hexColor) {
                props.style = {
                  // for contrast with next cell:
                  borderRightStyle: "solid",
                  borderRightWidth: "4px",
                  borderRightColor: "white",

                  // logic

                  background: hexColor,
                  color: getContrastYIQ(hexColor)
                };
              }
              return props;
            }
          },
          {
            Header: "Mat. Suppl.",
            accessor: keys.SHIPPER,
            Cell: ({ value }) => formatShipper(value || {}),
            getCellExportValue: ({ original }) => formatShipper(original.shipper || {}),
            setStyle: rowInfo => {
              const props = {};
              const hexColor = getNested(rowInfo, ["shipper", "annotation", "coding", "color"]);
              if (hexColor) {
                props.style = {
                  background: hexColor,
                  color: getContrastYIQ(hexColor)
                };
              }
              return props;
            }
          },
          {
            Header: <Popup content="Mode" trigger={<span>M</span>} />,
            getColumnExportValue: () => "Mode",
            accessor: keys.MODE,
            Cell: ({ value: mode }) => <ModeTag mode={mode} />
          },
          {
            Header: "Equipment",
            accessor: keys.EQUIPMENT_TYPE
          },
          {
            Header: "Item",
            accessor: keys.ITEM,
            Cell: ({ value }) => {
              const { description, commodity } = value || {};
              return (
                <Popup
                  trigger={<span>{commodity || description || " - "}</span>}
                  content={description}
                  disabled={!description}
                />
              );
            },
            getCellExportValue: ({ original }) => {
              return itemFormatter(getNested(original, keys.ITEM));
            }
          },
          {
            Header: <Popup content="Cooling" trigger={<span>C</span>} />,
            getColumnExportValue: () => "Cooling",
            getCellExportValue: ({ original }) => {
              return formatCooling(getNested(original, keys.ITEM_CONDITION));
            },
            accessor: keys.ITEM_CONDITION,
            Cell: ({ value: hasCooling }) => {
              // value returns {} or null

              return !!hasCooling ? (
                <Popup
                  content={
                    <>
                      {hasCooling.condition}{" "}
                      {hasCooling.range && (
                        <span
                          style={{ opacity: 0.5 }}
                        >{`${hasCooling.range.from}-${hasCooling.range.to} ${hasCooling.range.unit}`}</span>
                      )}
                    </>
                  }
                  trigger={<Icon name="thermometer" />}
                />
              ) : null;
            }
          },
          {
            Header: "Eq. id",
            accessor: keys.EQUIPMENT_ID,
            Cell: ({ value }) => <ItemEquipmentRefTag references={value} />,
            getCellExportValue: ({ original }) => {
              return equipmentFormatter(getNested(original, keys.EQUIPMENT_ID));
            }
          },
          {
            Header: "Loading",
            accessor: keys.PICKUP_LOCATION,
            disableSortBy: true,
            columns: [
              {
                Header: () => null,
                accessor: "pickup", // {}
                getColumnExportValue: () => "Pickup Date type",
                getCellExportValue: ({ original }) =>
                  formatDateType(getNested(original, keys.PICKUP_DATES) || {}),
                Cell: ({ value }) => <ShipmentDateTableCell stop={value} />
              },
              {
                Header: "Date",
                id: "pickupDay",
                accessor: keys.PICKUP_DATES, // {..., date, timeZone}
                Cell: ({ value }) => <DateTag date={value.date} options={{ weekday: "short" }} />,
                getColumnExportValue: () => "Pickup Date",
                getCellExportValue: ({ original }) =>
                  dateFormatter(getNested(original, keys.PICKUP_DATES) || {}),
                sortType: (row1, row2) => {
                  return (
                    (getNested(row1, ["original", keys.PICKUP_DATES, "date"]) || 0) -
                    (getNested(row2, ["original", keys.PICKUP_DATES, "date"]) || 0)
                  );
                }
              },
              {
                Header: "Time",
                id: "pickupTime",
                accessor: keys.PICKUP_DATES, // {..., date, timeZone}
                Cell: ({ value }) => (
                  <Popup
                    content={`Time shown in ${value.timeZone}`}
                    trigger={
                      <div style={{ cursor: "pointer" }}>
                        {/* don't pass in timezone as the time is converted in the load (avoid averse effects)*/}
                        <TimeTag date={value.date} />
                      </div>
                    }
                  />
                ),
                getColumnExportValue: () => "Pickup Time",
                getCellExportValue: ({ original }) =>
                  timeFormatter(getNested(original, keys.PICKUP_DATES)),
                disableSortBy: true
              },
              {
                id: "pickupTZ", // hidden column for export
                accessor: keys.PICKUP_DATES,
                Header: "",
                Cell: () => null,
                getColumnExportValue: () => "TZ",
                getCellExportValue: ({ original }) =>
                  timeZoneFormatter(getNested(original, keys.PICKUP_DATES)),
                disableSortBy: true
              },
              {
                Header: "Location",
                id: "pickupName",
                accessor: keys.PICKUP_LOCATION,
                getColumnExportValue: () => "Pickup Name",
                getCellExportValue: ({ original }) =>
                  locationNameFormatter(getNested(original, keys.PICKUP_LOCATION)),
                sortType: (row1, row2) => {
                  return (
                    getNested(row1, "original.pickup.location.annotation.coding.ediId") ||
                    getNested(row1, "original.pickup.location.name", "")
                  ).localeCompare(
                    getNested(row2, "original.pickup.location.annotation.coding.ediId") ||
                      getNested(row2, "original.pickup.location.name", "")
                  );
                },
                setStyle: rowInfo => {
                  const props = {};
                  const hexColor = getNested(rowInfo, [
                    "pickup",
                    "location",
                    "annotation",
                    "coding",
                    "color"
                  ]);
                  if (hexColor) {
                    props.style = {
                      background: hexColor,
                      color: getContrastYIQ(hexColor)
                    };
                  }

                  const code = getNested(rowInfo, [
                    "pickup",
                    "location",
                    "annotation",
                    "coding",
                    "ediId"
                  ]);

                  if (code) {
                    props.className = "center aligned";
                  }
                  return props;
                },
                Cell: ({ value }) => locationNameFormatter(value)
              },
              {
                Header: "",
                accessor: keys.PICKUP_LOCATION,
                id: "pickupLocation", // hidden column, used for export
                disableExport: false,
                getColumnExportValue: () => "Pickup Location",
                getCellExportValue: ({ original }) =>
                  locationFormatter(getNested(original, keys.PICKUP_LOCATION)),
                Cell: ({ value }) => locationFormatter(value)
              }
            ]
          },
          {
            Header: "Unloading",
            accessor: keys.DELIVERY_LOCATION,
            disableSortBy: true,
            columns: [
              {
                Header: () => null,
                accessor: "delivery", // {}
                getColumnExportValue: () => "Delivery Date type",
                getCellExportValue: ({ original }) =>
                  formatDateType(getNested(original, keys.DELIVERY_DATES) || {}),
                Cell: ({ value }) => <ShipmentDateTableCell stop={value} />
              },
              {
                Header: "Date",
                id: "deliveryDay",
                accessor: keys.DELIVERY_DATES, // {...,date, timeZone}
                Cell: ({ value }) => <DateTag date={value.date} />,
                getColumnExportValue: () => "Delivery Date",
                getCellExportValue: ({ original }) =>
                  dateFormatter(getNested(original, keys.DELIVERY_DATES) || {}),
                sortType: (row1, row2) => {
                  return (
                    (getNested(row1, ["original", keys.DELIVERY_DATES, "date"]) || 0) -
                    (getNested(row2, ["original", keys.DELIVERY_DATES, "date"]) || 0)
                  );
                }
              },
              {
                Header: "Time",
                id: "deliveryTime",
                accessor: "deliveryDate",
                Cell: ({ value }) => (
                  <Popup
                    content={`Time shown in ${value.timeZone}`}
                    trigger={
                      <div style={{ cursor: "pointer" }}>
                        {/* don't pass in timezone as the time is converted in the load (avoid averse effects)*/}
                        <TimeTag date={value.date} />
                      </div>
                    }
                  />
                ),
                getColumnExportValue: () => "Delivery Time",
                getCellExportValue: ({ original }) =>
                  timeFormatter(getNested(original, keys.DELIVERY_DATES)),
                disableSortBy: true
              },
              {
                id: "deliveryTZ", // hidden column, used for export
                accessor: keys.DELIVERY_DATES,
                Header: "",
                Cell: () => null,
                getColumnExportValue: () => "TZ",
                getCellExportValue: ({ original }) =>
                  timeZoneFormatter(getNested(original, keys.DELIVERY_DATES)),
                disableSortBy: true
              },
              {
                Header: "Location",
                accessor: keys.DELIVERY_LOCATION,
                id: "deliveryName",
                getColumnExportValue: () => "Delivery Name",
                getCellExportValue: ({ original }) =>
                  locationNameFormatter(getNested(original, keys.DELIVERY_LOCATION)),
                sortType: (row1, row2) => {
                  return (
                    getNested(row1, "original.delivery.location.annotation.coding.ediId") ||
                    getNested(row1, "original.delivery.location.name", "")
                  ).localeCompare(
                    getNested(row2, "original.delivery.location.annotation.coding.ediId") ||
                      getNested(row2, "original.delivery.location.name", "")
                  );
                },
                setStyle: rowInfo => {
                  const props = {};
                  const hexColor = getNested(rowInfo, [
                    "delivery",
                    "location",
                    "annotation",
                    "coding",
                    "color"
                  ]);
                  if (hexColor) {
                    props.style = {
                      background: hexColor,
                      color: getContrastYIQ(hexColor)
                    };
                  }

                  const code = getNested(rowInfo, [
                    "delivery",
                    "location",
                    "annotation",
                    "coding",
                    "ediId"
                  ]);

                  if (code) {
                    props.className = "center aligned";
                  }
                  return props;
                },
                Cell: ({ value }) => locationNameFormatter(value)
              },
              {
                Header: "",
                accessor: keys.DELIVERY_LOCATION,
                id: "deliveryLocation", // hidden column, used for export
                disableExport: false,
                getColumnExportValue: () => "Delivery Location",
                getCellExportValue: ({ original }) =>
                  locationFormatter(getNested(original, keys.DELIVERY_LOCATION)),
                Cell: ({ value }) => locationFormatter(value)
              }
            ]
          },
          {
            Header: <Popup content="Is tendered" trigger={<span>T</span>} />,
            getColumnExportValue: () => "Tendered",
            getCellExportValue: ({ original }) => String(getNested(original, keys.IS_TENDERED)),
            accessor: keys.IS_TENDERED,
            Cell: props => {
              const isTendered = getNested(props, "value");
              const color = isTendered ? "green" : "red";
              return <StatusTag color={color} />;
            }
          },
          {
            Header: <Popup content="Total cost" trigger={<span>Cost</span>} />,
            id: "totalCost",
            accessor: keys.TOTAL_COST, // returns{}
            disableExport: true,
            Cell: ({ row: { original } }) => {
              const canViewCosts = getNested(original, ["canViewCosts"]);
              const costs = getNested(original, ["totals"]) || {};
              return canViewCosts ? (
                <CurrencyTag value={costs.total} currency={costs.targetCurrency} />
              ) : (
                " - "
              );
            }
          },
          {
            Header: <Popup content="Manually added costs" trigger={<span>Add.</span>} />,
            id: "manualCost",
            accessor: keys.MANUAL_COST,
            disableExport: true,
            Cell: ({ row: { original } }) => {
              const canViewCosts = getNested(original, ["canViewCosts"]);
              const costs = getNested(original, ["totals"]) || {};
              return canViewCosts ? (
                <CurrencyTag value={costs.additional} currency={costs.targetCurrency} />
              ) : (
                " - "
              );
            }
          }
        ]}
        initialState={{
          hiddenColumns: ["pickupLocation", "deliveryLocation", "pickupTz", "deliveryTz"]
        }}
        onExportData={onExportData}
      />
      <ConfirmComponent
        show={confirmData.show}
        showConfirm={show => setConfirm({ ...confirmData, show })}
        content={confirmData.content}
        onConfirm={onConfirmUnlink}
      />
    </div>
  );
};

export default InboundOutboundShipmentTable;
