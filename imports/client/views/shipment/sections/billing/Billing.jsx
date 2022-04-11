import React, { useContext, useState } from "react";
import { useQuery } from "@apollo/client";
import { Trans } from "react-i18next";
import { Button, Table, Icon } from "semantic-ui-react";
import { IconSegment } from "../../../../components/utilities/IconSegment";
import { tabProptypes } from "/imports/client/views/shipment/utils/propTypes";
import CurrencyTag from "/imports/client/components/tags/CurrencyTag";
import { GET_BILLING_INFO } from "./queries";
import { DEFAULT_CURRENCY } from "/imports/api/_jsonSchemas/enums/costs";
import BillingItemModal from "./modals/BillingItemModal";
import LoginContext from "/imports/client/context/loginContext";

const debug = require("debug")("shipment:billing");

const COL_WIDTH = [10, 5, 1];

let totalInvoiced = 0;
let totalOpen = 0;

const InvoicedItems = ({ invoicedItems = {}, currency }) => {
  const hasInvoices = Object.keys(invoicedItems).length > 0;
  totalInvoiced = 0;
  return hasInvoices ? (
    <>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              colSpan={3}
              content={
                <b>
                  <Trans i18nKey="shipment.billing.billed" />
                </b>
              }
            />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Object.entries(invoicedItems).map(([invoiceId, items], i) => {
            const invoiceTotal = items.reduce((acc, cur) => {
              return acc + cur.amount;
            }, 0);
            totalInvoiced += invoiceTotal;
            return (
              <Table.Row key={`invoice-${i}`}>
                <Table.Cell content={<a href="">{invoiceId}</a>} width={COL_WIDTH[0]} />
                <Table.Cell
                  content={<CurrencyTag value={invoiceTotal} currency={currency} />}
                  width={COL_WIDTH[1]}
                />
                <Table.Cell width={COL_WIDTH[2]} />
              </Table.Row>
            );
          })}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell
              content={
                <i>
                  <Trans i18nKey="shipment.billing.totalBilled" />
                </i>
              }
            />
            <Table.HeaderCell content={<CurrencyTag value={totalInvoiced} currency={currency} />} />
            <Table.HeaderCell />
          </Table.Row>
        </Table.Footer>
      </Table>
    </>
  ) : null;
};

const OpenBillingLines = ({ openItems = [], currency }) => {
  totalOpen = openItems.reduce((acc, cur) => {
    return acc + cur.amount;
  }, 0);
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell
            colSpan={3}
            content={
              <b>
                <Trans i18nKey="shipment.billing.toBeBilled" />
              </b>
            }
          />
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {openItems.map((item, i) => (
          <Table.Row key={`billing-item-${i}`}>
            <Table.Cell content={item.description} width={COL_WIDTH[0]} />
            <Table.Cell
              content={<CurrencyTag value={item.amount} currency={currency} />}
              width={COL_WIDTH[1]}
            />
            <Table.Cell
              width={COL_WIDTH[2]}
              content={
                !item.isFreight && <Icon name="trash alternate" style={{ cursor: "pointer" }} />
              }
            />
          </Table.Row>
        ))}
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.HeaderCell
            content={
              <i>
                <Trans i18nKey="shipment.billing.totalUnbilled" />
              </i>
            }
          />
          <Table.HeaderCell content={<CurrencyTag value={totalOpen} currency={currency} />} />
          <Table.HeaderCell
            content={<Button primary content={<Trans i18nKey="shipment.billing.generate" />} />}
          />
        </Table.Row>
      </Table.Footer>
    </Table>
  );
};

const ShipmentBilling = ({ shipmentId }) => {
  const [show, showModal] = useState(false);
  const { data = {}, loading, error } = useQuery(GET_BILLING_INFO, { variables: { shipmentId } });
  if (error) {
    console.error(error);
  }
  debug("apollo data: %o", { data, loading, error });

  const { billingInfo = {} } = data;
  const totalFreightCost = billingInfo.totals?.total || 0;
  const currency = billingInfo.billing?.currency || DEFAULT_CURRENCY;
  const allitems = billingInfo.billing?.items || [];
  const openItems = allitems.filter(({ invoiceId }) => !invoiceId);

  const invoicedItems = allitems
    .filter(({ invoiceId }) => !!invoiceId)
    .reduce((rv, x) => {
      (rv[x.invoiceId] = rv[x.invoiceId] || []).push(x);
      return rv;
    }, {});
  const totalInvoicedFreightCost = allitems
    .filter(({ invoiceId, isFreight }) => !!invoiceId && isFreight)
    .reduce((rv, x) => {
      return rv + x;
    }, 0);

  const openFreightTotal = totalFreightCost - totalInvoicedFreightCost || 0;
  const openFreightItem = {
    description: "Freight", // TODO translate this item
    amount: openFreightTotal,
    invoiceId: null,
    isFreight: true
  };

  openItems.unshift(openFreightItem);

  const total = allitems.reduce((acc, cur) => {
    return acc + cur.amount;
  }, openFreightTotal);

  return (
    <IconSegment
      title={<Trans i18nKey="shipment.billing.title" />}
      name="billing"
      icon="money bill alternate outline"
      loading={loading}
      body={
        <>
          <Table>
            <Table.Body>
              <Table.Row>
                <Table.Cell
                  colSpan={3}
                  style={{ padding: 0 }}
                  content={<OpenBillingLines openItems={openItems} currency={currency} />}
                />
              </Table.Row>
              <Table.Row>
                <Table.Cell
                  colSpan={3}
                  style={{ padding: 0 }}
                  content={<InvoicedItems invoicedItems={invoicedItems} currency={currency} />}
                />
              </Table.Row>
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell
                  width={COL_WIDTH[0]}
                  content={
                    <strong>
                      <Trans i18nKey="shipment.billing.total" />
                    </strong>
                  }
                />
                <Table.HeaderCell
                  width={COL_WIDTH[1]}
                  content={<CurrencyTag value={total} currency={currency} />}
                />
                <Table.HeaderCell width={COL_WIDTH[2]} />
              </Table.Row>
            </Table.Footer>
          </Table>
        </>
      }
      footer={
        <>
          <Button
            primary
            content={<Trans i18nKey="shipment.billing.add" />}
            onClick={() => showModal(true)}
          />
          <BillingItemModal show={show} showModal={showModal} />
        </>
      }
    />
  );
};

const ShipmentBillingAccessCheck = props => {
  const { account } = useContext(LoginContext);
  const hasFeature = (account?.features || []).includes("shipmentBilling");
  const { security } = props;

  if (!security.canEditBilling || !hasFeature) return null;
  return <ShipmentBilling {...props} />;
};

ShipmentBillingAccessCheck.propTypes = tabProptypes;

export default ShipmentBillingAccessCheck;
