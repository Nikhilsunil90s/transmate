import React from "react";
import PropTypes from "prop-types";
import { Trans } from "react-i18next";
import get from "lodash.get";

import { Table } from "semantic-ui-react";
import { CurrencyTag } from "/imports/client/components/tags";
import CostItemsTable from "./CostItemTable";
import CostInvoiceTable from "./CostInvoiceTable";

import { costTableSecurity } from "../utils/propTypes";

/**
 * table that holds the totals & checks if there is an invoice
 * if folded, show totals
 * if unfolded, show details on top of total
 * @param {Object} costData
 * @param {Array=} costData.calculated
 * @param {Array=} costData.invoices
 * @param {Array=} costData.invoices.$
 * @param {Number} costData.totalInvoiceCosts
 * @param {Number} costData.totalShipmentCosts
 * @param {Number} costData.totalInvoiceDelta
 * @param {String} costData.baseCurrency
 */
const CostTable = ({ ...props }) => {
  const { costData, ...baseProps } = props;
  const hasCosts = get(costData, "calculated.length") > 0;
  const hasInvoice = get(costData, "invoices.length") > 0;
  const showDelta = hasInvoice && hasCosts;
  const showTable = hasInvoice || hasCosts;

  return (
    showTable && (
      <Table celled>
        <Table.Body>
          {[
            hasCosts && (
              <Table.Row key="costs">
                <Table.Cell colSpan={3} style={{ padding: 0 }}>
                  <CostItemsTable
                    {...baseProps}
                    costs={costData.calculated}
                    baseCurrency={costData.baseCurrency}
                    context="shipment"
                    showHeader
                  />
                </Table.Cell>
              </Table.Row>
            ),
            hasInvoice && (
              <Table.Row key="invoice">
                <Table.Cell colSpan={3} style={{ padding: 0 }}>
                  <CostInvoiceTable
                    {...baseProps}
                    invoices={costData.invoices}
                    baseCurrency={costData.baseCurrency}
                    showHeader={!hasCosts}
                  />
                </Table.Cell>
              </Table.Row>
            )
          ]}
        </Table.Body>
        {showDelta && (
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan={2} width={13}>
                <b>
                  <Trans i18nKey="shipment.costs.total.delta" />
                </b>
                <span style={{ float: "right" }}>
                  <b>
                    <CurrencyTag
                      value={costData.totalInvoiceDelta}
                      currency={costData.baseCurrency}
                    />
                  </b>
                </span>
              </Table.HeaderCell>
              <Table.Cell width={3} />
            </Table.Row>
          </Table.Footer>
        )}
      </Table>
    )
  );
};

export default CostTable;

CostTable.propTypes = {
  costData: PropTypes.shape({
    calculated: PropTypes.arrayOf(PropTypes.object),
    invoices: PropTypes.arrayOf(PropTypes.object),
    totalInvoiceCosts: PropTypes.number,
    totalShipmentCosts: PropTypes.number,
    totalInvoiceDelta: PropTypes.number,
    baseCurrency: PropTypes.string
  }),
  shipment: PropTypes.object, // if loaded in shipment page
  security: PropTypes.shape({
    ...costTableSecurity
  }).isRequired
};
