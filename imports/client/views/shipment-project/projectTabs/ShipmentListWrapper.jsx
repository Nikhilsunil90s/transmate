import React, { useContext } from "react";
import { useQuery } from "@apollo/client";
import get from "lodash.get";

import { InboundOutboundShipmentTable, COLUMN_KEYS } from "../components";
import Loader from "/imports/client/components/utilities/Loader.jsx";

import { GET_SHIPMENTS_BY_PROJECT } from "../utils/queries";
import LoginContext from "/imports/client/context/loginContext";
import { getTimezoneOffset } from "/imports/utils/functions/timeConverter";

const debug = require("debug")("shipment:project:wrapper");

//#region helpers
const sortFn = (a, b) => {
  const ax = get(a, ["shipper", "annotation", "coding", "code"]);
  const bx = get(b, ["shipper", "annotation", "coding", "code"]);
  if ((ax === null || ax === undefined) && (bx === null || bx === undefined)) {
    // both undefined -> sort on name
    const axn = get(a, ["shipper", "name"]);
    const bxn = get(b, ["shipper", "name"]);
    if (axn > bxn) return 1;
    if (axn < bxn) return -1;
  }
  if (ax === null || ax === undefined) return 1; // null at the end
  if (bx === null || bx === undefined) return -1; // null at the end
  if (ax > bx) return 1;
  if (ax < bx) return -1;
  return 0;
};

// eslint-disable-next-line new-cap
const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
const userTZOffset = getTimezoneOffset(userTZ) / 60;
const buildDate = stop => {
  const locationTZ = stop.location?.timeZone;
  const hourDiff = locationTZ ? getTimezoneOffset(locationTZ) / 60 : userTZOffset;
  const hoursToAdd = hourDiff - userTZOffset;

  const requested = stop.date;
  const planned = stop.datePlanned;
  const scheduled = stop.dateScheduled;
  const actual = stop.dateActual;

  const date = new Date(actual || scheduled || planned || requested);
  date.setHours(date.getHours() + hoursToAdd);

  return {
    isPlanned: !!planned,
    isScheduled: !!scheduled,
    isActual: !!actual,
    date,
    timeZone: locationTZ || userTZ
  };
};

const mapShipmentData = (shipments = [], userHasRole, accountId) =>
  shipments.map(({ ...shipment }) => ({
    ...shipment,
    canViewCosts:
      userHasRole &&
      (shipment.accountId === accountId ||
        ((shipment.carrierIds || []).includes(accountId) &&
          !["draft", "canceled"].includes(shipment.status))),
    pickupDate: buildDate(shipment.pickup),
    deliveryDate: buildDate(shipment.delivery)
  }));

//#endregion

const ShipmentListWrapper = ({ type, shipmentProjectId, canEdit, onExportData }) => {
  const { accountId, roles } = useContext(LoginContext);
  const userHasRole = roles.includes("core-shipment-viewCosts");

  const { data: shipmentData = {}, loading, error, refetch } = useQuery(GET_SHIPMENTS_BY_PROJECT, {
    variables: { input: { shipmentProjectId, type } },
    fetchPolicy: "no-cache"
  });

  const shipments = mapShipmentData(shipmentData.shipments, userHasRole, accountId).sort(sortFn);
  debug("mapShipmentData %o", { shipments, loading, error });

  return loading ? (
    <Loader loading={loading} />
  ) : (
    <InboundOutboundShipmentTable
      projectId={shipmentProjectId}
      type={type}
      shipments={shipments}
      keys={COLUMN_KEYS}
      canEdit={canEdit}
      onExportData={onExportData}
      refetch={refetch}
    />
  );
};

export default ShipmentListWrapper;
