/* eslint-disable no-use-before-define */
import React, { useContext } from "react";
import { useQuery } from "@apollo/client";

// UI
import ShipmentCostsSection from "./Costs.jsx";
import { tabProptypes } from "/imports/client/views/shipment/utils/propTypes.js";

import { GET_SHIPMENT_COSTS } from "./utils/queries";

import { initializeSecurity } from "../../utils/security.js";
import LoginContext from "/imports/client/context/loginContext.js";

const debug = require("debug")("shipment:UI");

const ShipmentCostsSectionLoader = ({ shipmentId, shipment, ...props }) => {
  const context = useContext(LoginContext);

  //#region get shipment costs
  debug("load cost for %o", shipmentId);
  const { data: costDetailsData = {}, loading, error, refetch } = useQuery(GET_SHIPMENT_COSTS, {
    variables: { shipmentId },
    skip: !shipmentId
  });
  if (error) console.error(error);
  debug("GQL costs loader GET_SHIPMENT_COSTS", {
    shipmentId,
    data: costDetailsData,
    loading,
    error
  });
  const costData = costDetailsData.result?.costDetail || {};
  //#endregion

  const costSecurity = initializeSecurity({
    shipment: {
      ...shipment,
      costs: costData.calculated || []
    },
    context
  });

  const security = {
    ...props.security,
    ...costSecurity
  };

  return (
    <ShipmentCostsSection
      {...{
        ...props,
        loading,
        security,
        shipmentId,
        shipment,
        costData,
        refresh: refetch
      }}
    />
  );
};

ShipmentCostsSectionLoader.propTypes = tabProptypes;
export default ShipmentCostsSectionLoader;
