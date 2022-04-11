import { toast } from "react-toastify";
import PropTypes from "prop-types";
import React, { useState, useMemo } from "react";
import { useApolloClient } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";
import get from "lodash.get";
import classNames from "classnames";

import { Table, Icon, Button, Popup, Loader } from "semantic-ui-react";
import ShipmentDeclineCostModal from "../modals/Decline.jsx";
import { PartnerTag, CurrencyTag } from "/imports/client/components/tags";

import initializeConfirm from "/imports/client/components/modals/confirm";

import { APPROVE_DECLINE_COSTS, EDIT_SHIPMENT_COST } from "../utils/queries";

const debug = require("debug")("shipment:costs");

function calculateSubtotal({ costs }) {
  return costs.reduce((memo, cost) => {
    if (cost.source === "input" && get(cost, "response.approved") === false) {
      return memo;
    }
    const { amount, calculatedExchange } = cost || {};
    const { value, convertedQty, rate } = amount || {};
    const val = convertedQty || (calculatedExchange || rate || 1) * value;

    return memo + val;
  }, 0);
}

const ShipmentCostItemActions = ({ shipmentId, cost, security }) => {
  const client = useApolloClient();
  const [isLoading, setLoading] = useState();
  const { showConfirm, Confirm } = initializeConfirm();
  const canApproveDecline = cost.forApproval && security.canApproveDecline(cost);
  const canRemoveManualCost = security.canRemoveManualCost(cost);

  const saveResponse = ({ action, response }, cb) => {
    debug("approve/decline %o", { shipmentId, index: cost.orgIndex, response, action });
    setLoading(true);
    client
      .mutate({
        mutation: APPROVE_DECLINE_COSTS,
        variables: {
          input: {
            shipmentId,
            index: cost.orgIndex,
            response,
            action
          }
        },
        skip: !shipmentId
      })
      .then(({ error, data }) => {
        debug("GQL ShipmentCostItemActions response data %o error %o", data, error);
        if (error) throw error;
        toast.success(action === "approve" ? "Cost approved" : "Cost declined");
        setLoading(false);
        if (cb) cb();
      })
      .catch(() => {
        toast.error(`Could not ${action} cost`);
        setLoading(false);
      });
  };

  const handleApprove = () => saveResponse({ action: "approve" });
  const handleDecline = ({ response }, cb) => saveResponse({ action: "decline", response }, cb);

  const handleDelete = () => {
    setLoading(true);
    debug("removing cost @ index %s", cost.orgIndex);
    client
      .mutate({
        mutation: EDIT_SHIPMENT_COST,
        variables: {
          input: {
            shipmentId,
            index: cost.orgIndex
          }
        },
        skip: !shipmentId
      })
      .then(({ errors, data }) => {
        debug("gql result handleDelete %o ", { errors, data });
        if (errors) throw errors;
        setLoading(false);
        showConfirm(false);
        toast.success("Costs removed");
      })
      .catch(() => toast.error("Could delete cost"));
  };

  // const orgIndex is passed in
  return isLoading ? (
    <Loader active inline />
  ) : (
    <Button.Group floated="right" size="mini">
      {canApproveDecline && (
        <>
          <Button data-test="approveCostBtn" icon="check" onClick={handleApprove} />
          <ShipmentDeclineCostModal key="decline" onSave={handleDecline}>
            <Button data-test="declineCostBtn" icon="remove" onClick={handleApprove} />
          </ShipmentDeclineCostModal>
        </>
      )}
      {canRemoveManualCost && (
        <>
          <Button
            key="remove"
            icon="trash"
            onClick={() => showConfirm(true)}
            data-test="removeCostBtn"
          />
          <Confirm onConfirm={handleDelete} />
        </>
      )}
    </Button.Group>
  );
};

/**
 * cost detail table
 * can be expanded or collapsed (== only footer visible)
 */
const SOURCE_ICON_MAP = {
  priceList: "list alternate outline",
  input: "hand paper outline",
  invoice: "file alternate outline",
  api: "plug"
};

// costs is the mapped cost array from the shipment.getCosts array
const CostItemsTable = ({
  shipmentId,
  costs = [],
  baseCurrency,
  security,
  showHeader,
  context = "shipment",
  ...props
}) => {
  const { t } = useTranslation();
  debug("calculate subtotal on %o", costs);
  const subTotal = useMemo(() => calculateSubtotal({ costs }), [costs]);
  const mainCarrierId = get(props, ["shipment", "carrierIds", 0]);
  debug("subTotal %s", subTotal);

  return (
    <Table celled className="costDetail">
      {showHeader && (
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width={10}>
              <Trans i18nKey="shipment.costs.table.description" />
            </Table.HeaderCell>
            <Table.HeaderCell width={3} textAlign="right">
              <Trans i18nKey="shipment.costs.table.amount" />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
      )}
      <Table.Body>
        {costs.map((cost, i) => {
          debug("process cost %o", cost);
          const sourceIcon = SOURCE_ICON_MAP[cost.source];
          const canSeeApproved = security.canViewCostLabel(cost);
          const hasResponse = !!cost.response;
          const showApproved = hasResponse && canSeeApproved && get(cost, "response.approved");
          const showDeclined =
            hasResponse && canSeeApproved && get(cost, "response.approved") === false;
          const showSeller = mainCarrierId && cost.sellerId && mainCarrierId !== cost.sellerId;
          const calculatedExchange = cost.calculatedExchange || cost.amount.rate;
          const convertedAmount = cost.amount.value * (calculatedExchange || 1);

          return (
            <Table.Row key={i} className={classNames({ declined: showDeclined })}>
              <Table.Cell width={10}>
                {sourceIcon && <Icon name={sourceIcon} />}
                {cost.description}
                {showSeller && (
                  <>
                    {" ("}
                    <PartnerTag accountId={cost.sellerId} />)
                  </>
                )}
                {canSeeApproved && hasResponse && (
                  <span style={{ float: "right", opacity: 0.5 }}>
                    {showApproved && t("shipment.costs.approved")}
                    {showDeclined && t("shipment.costs.declined")}
                  </span>
                )}
              </Table.Cell>
              <Popup
                position="top right"
                content={cost.tooltip}
                trigger={
                  <Table.Cell width={3} textAlign="right">
                    <div>
                      {calculatedExchange && calculatedExchange !== 1 && (
                        <span style={{ opacity: 0.5, marginRight: "5px" }}>
                          (
                          <CurrencyTag value={cost.amount.value} currency={cost.amount.currency} />)
                        </span>
                      )}
                      <CurrencyTag value={convertedAmount} currency={baseCurrency} />
                    </div>
                  </Table.Cell>
                }
                disabled={!cost.tooltip}
              />
              <Table.Cell className="actions" width={3}>
                <ShipmentCostItemActions {...{ shipmentId, cost, security }} />
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.HeaderCell colSpan={2}>
            <b>{t(`shipment.costs.subTotal.${context}`)}</b>
            <span style={{ float: "right" }}>
              <b>
                <CurrencyTag value={subTotal} currency={baseCurrency} />
              </b>
            </span>
          </Table.HeaderCell>
        </Table.Row>
      </Table.Footer>
    </Table>
  );
};

export default CostItemsTable;

CostItemsTable.propTypes = {
  shipmentId: PropTypes.string,
  costs: PropTypes.arrayOf(PropTypes.object),
  baseCurrency: PropTypes.string,
  security: PropTypes.object,
  showHeader: PropTypes.bool,
  context: PropTypes.oneOf(["shipment", "invoice"]),
  shipment: PropTypes.object // if loaded from shipment page
};
