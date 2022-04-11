/* eslint-disable no-use-before-define */
import React from "react";
import { Trans } from "react-i18next";
import PropTypes from "prop-types";
import get from "lodash.get";

// UI
import { IconSegment } from "../../../../components/utilities/IconSegment";
import ShipmentCostFooter from "./components/Footer";
import ShipmentCostChange from "./components/CostChange";
import ShipmentCostActions from "./components/CostActions";
import ShipmentCostsAdvanced from "./components/CostAdvanced";
import CostTable from "./table/CostTable";

const CostSectionBody = ({ ...props }) => {
  const { shipment, security } = props;
  const isCarrierSelected = get(shipment, "carrierIds.length") > 0;
  const { canSelectCarrier } = security;

  return (
    <>
      {isCarrierSelected ? (
        <ShipmentCostChange key="costChange" {...{ canSelectCarrier, ...props }} />
      ) : (
        <ShipmentCostActions key="costActions" {...props} />
      )}
      <ShipmentCostsAdvanced key="costAdvanced" {...props} />
      <CostTable key="costTable" {...props} />
    </>
  );
};

const ShipmentCostsSection = ({ ...props }) => {
  const { loading, security } = props;
  const { canViewCostSection } = security || {};

  if (!canViewCostSection) return null;
  return (
    <IconSegment
      name="costs"
      icon="money"
      loading={loading}
      title={<Trans i18nKey="shipment.form.costs.title" />}
      body={<CostSectionBody {...props} />}
      footerElement={<ShipmentCostFooter {...props} />}
    />
  );
};

ShipmentCostsSection.propTypes = {
  shipment: PropTypes.object,
  costData: PropTypes.shape({
    baseCurrency: PropTypes.string,
    calculated: PropTypes.array,
    invoices: PropTypes.array,
    totalInvoiceDelta: PropTypes.number,
    totalShipmentCosts: PropTypes.number
  }),
  security: PropTypes.object,
  onSave: PropTypes.func,
  refresh: PropTypes.func
};

export default ShipmentCostsSection;
