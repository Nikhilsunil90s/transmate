/* eslint-disable no-use-before-define */
import { toast } from "react-toastify";
import React from "react";
import { useApolloClient } from "@apollo/client";
import { Trans } from "react-i18next";
import get from "lodash.get";
import { Segment, Button } from "semantic-ui-react";

import { toggleSidePanel } from "../../../sidebar/toggleSidePanel";
import ShipmentBaseCostModal from "../modals/Base.jsx";
import ShipmentAdditionalCostModal from "../modals/Additional.jsx";
import SelectPartnerModal from "/imports/client/components/modals/specific/partnerSelect.jsx";
import initializeConfirm from "/imports/client/components/modals/confirm";

import { SELECT_CARRIER, RESET_SHIPMENT_COSTS } from "../utils/queries";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("shipment:costs");

const ShipmentCostFooter = ({ ...props }) => {
  const client = useApolloClient();
  const { shipment, shipmentId, security, refresh } = props; // refresh only refreshes cost options
  const hasCarriers = get(shipment, "carrierIds.length") > 0;
  const { canSelectCarrier, canAddBaseCost, canAddManualCost, canResetCarrier } = security;
  const { showConfirm, Confirm } = initializeConfirm();
  const { goRoute } = useRoute();

  const onSelectPartner = ({ partnerId }) => {
    debug("selecting carrier: %s", partnerId);
    if (partnerId) {
      client
        .mutate({
          mutation: SELECT_CARRIER,
          variables: {
            shipmentId,
            carrierId: partnerId
          }
        })
        .then(({ errors }) => {
          if (errors) throw errors;
          toast.success("Partner saved");
        })
        .catch(() => toast.error("Could not save partner"));
    }
  };

  const resetShipmentCosts = () => {
    debug("reset all shipment costs");
    client
      .mutate({ mutation: RESET_SHIPMENT_COSTS, variables: { shipmentId } })
      .then(({ errors }) => {
        if (errors) throw errors;
        toast.success("Costs have been reset");
        showConfirm(false);
      })
      .catch(() => toast.error("Could not reset costs"));
  };

  return (
    <Segment as="footer">
      <div>
        {!hasCarriers && canSelectCarrier && (
          <SelectPartnerModal
            title={<Trans i18nKey="price.request.partner.modal.title" />}
            options={{ types: ["carrier", "provider"] }}
            onSave={onSelectPartner}
          >
            <Button
              primary
              basic
              content={<Trans i18nKey="shipment.form.costs.button.manual" />}
              data-test="selectCarrierManual"
            />
          </SelectPartnerModal>
        )}
        {canAddBaseCost && (
          <ShipmentBaseCostModal shipmentId={shipmentId} refresh={refresh}>
            <Button icon="plus" content={<Trans i18nKey="shipment.form.costs.costs.add.base" />} />
          </ShipmentBaseCostModal>
        )}
        {canAddManualCost && (
          <ShipmentAdditionalCostModal shipmentId={shipmentId} refresh={refresh}>
            <Button
              icon="plus"
              content={<Trans i18nKey="shipment.form.costs.costs.add.additional" />}
            />
          </ShipmentAdditionalCostModal>
        )}
      </div>
      <div>
        <Confirm
          onConfirm={resetShipmentCosts}
          content={<Trans i18nKey="shipment.form.costs.reset.prompt" />}
        />
        {canResetCarrier && (
          <a
            style={{ cursor: "pointer" }}
            onClick={() => showConfirm(true)}
            data-test="resetCostsBtn"
          >
            <Trans i18nKey="shipment.form.costs.reset.button" />
          </a>
        )}
        {shipment.priceRequestId ? (
          <Button
            key="btn"
            data-test="openLinkedPriceRequest"
            as="a"
            onClick={() => {
              goRoute("priceRequestEdit", { _id: shipment.priceRequestId });
            }}
            content={<Trans i18nKey="shipment.form.costs.button.view-request" />}
          />
        ) : (
          ""
        )}
        <Button
          primary
          icon="lightbulb outline"
          content={<Trans i18nKey="shipment.form.costs.insights.button" />}
          onClick={toggleSidePanel}
          data-test="insightsBtn"
        />
      </div>
    </Segment>
  );
};

export default ShipmentCostFooter;
