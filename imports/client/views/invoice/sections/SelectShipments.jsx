import React, { useState } from "react";
import get from "lodash.get";
import pick from "lodash.pick";

import { Segment, Table, Grid, Button } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { useQuery, useMutation } from "@apollo/client";
import { currencyFormat } from "/imports/utils/UI/helpers";

import { tabPropTypes } from "../utils/_tabProptypes";
import ReactTable from "/imports/client/components/tables/ReactTable";
import {
  LocationSummaryTag,
  MomentTag,
  TotalCostTag,
  ShipmentReferenceTag
} from "/imports/client/components/tags";

import { ADD_SHIPMENT_COST_ITEMS, GET_UNINVOICED_SHIPMENTS } from "../utils/queries";
import { DEFAULT_CURRENCY } from "/imports/api/_jsonSchemas/enums/costs";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("invoice:select");

//#region components
function getTotalCosts(costs = []) {
  return costs.reduce((acc, cur) => {
    const convertedValue =
      get(cur, ["amount", "value"], 0) *
      (get(cur, ["amount", "rate"]) || cur.calculatedExchange || 1);

    return convertedValue + acc;
  }, 0);
}
function getTotalForSelectedItems(items = []) {
  return items.reduce((accItems, item) => {
    const itemTotal = getTotalCosts(item.costs);
    return itemTotal + accItems;
  }, 0);
}
function getTotalInvoiced(items = []) {
  return items.reduce((acc, cur) => {
    const itemTotal = get(cur, ["invoice", "total"], 0);
    return acc + itemTotal;
  }, 0);
}
function cleanItems(items = []) {
  return items.map(({ id, costs = [] }) => ({
    id,
    costs: costs.map(cost => ({
      ...pick(cost, ["id", "costId", "description"]),
      amount: {
        value: get(cost, "amount.value"),
        currency: get(cost, "amount.currency"),
        rate: cost.calculatedExchange || get(cost, "amount.rate")
      }
    }))
  }));
}

export const SelectionOverview = ({
  selectedItems = [],
  currency,
  invoice = {},
  refetch,
  resetShipments
}) => {
  const displayCurrency = currency || DEFAULT_CURRENCY;
  const totalSelectedAmount = getTotalForSelectedItems(selectedItems);
  const totalConfirmatedAmount = getTotalInvoiced(invoice.shipments);
  const totalConfirmedCount = get(invoice, ["itemCount"], 0);
  let mutationLoading = false;
  const { params } = useRoute();

  const canConfirm = selectedItems.length > 0;

  // adding shipment costs items:
  const [addShipmentCostItems] = useMutation(ADD_SHIPMENT_COST_ITEMS);
  const onConfirmAddShipmentItems = async () => {
    const { data, loading: isMutationLoading, error: mutationError } = await addShipmentCostItems({
      variables: {
        input: {
          invoiceId: params._id,
          items: cleanItems(selectedItems)
        }
      }
    });
    debug("add selected shipments result: %o", {
      data,
      mutationLoading,
      isMutationLoading
    });

    mutationLoading = isMutationLoading;

    if (mutationError) {
      console.error("change node error", mutationError);
      return;
    }
    refetch();
    resetShipments();
  };

  const addItems = () => {
    onConfirmAddShipmentItems();
  };

  return (
    <Segment padded="very">
      <Grid columns={2}>
        <Grid.Row>
          <Grid.Column>
            <Table definition>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell />
                  <Table.HeaderCell content="#" />
                  <Table.HeaderCell content="Total" />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                <Table.Row>
                  <Table.Cell content="Confirmed items" />
                  <Table.Cell content={totalConfirmedCount} />
                  <Table.Cell content={currencyFormat(totalConfirmatedAmount, displayCurrency)} />
                </Table.Row>
              </Table.Body>
              <Table.Body>
                <Table.Row>
                  <Table.Cell content="Current selected items" />
                  <Table.Cell content={selectedItems.length} />
                  <Table.Cell content={currencyFormat(totalSelectedAmount, displayCurrency)} />
                </Table.Row>
              </Table.Body>
              <Table.Footer>
                <Table.Row>
                  <Table.HeaderCell />
                  <Table.HeaderCell content={totalConfirmedCount + selectedItems.length} />
                  <Table.HeaderCell
                    content={currencyFormat(
                      totalConfirmatedAmount + totalSelectedAmount,
                      displayCurrency
                    )}
                  />
                </Table.Row>
              </Table.Footer>
            </Table>
          </Grid.Column>
          <Grid.Column />
        </Grid.Row>
      </Grid>
      <Segment as="footer">
        <Button as="a" primary disabled={!canConfirm} onClick={addItems} loading={mutationLoading}>
          Confirm
        </Button>
      </Segment>
    </Segment>
  );
};

export const SelectShipments = ({ shipments = [], currency, loading, setSelectedItems }) => {
  const columns = [
    {
      accessor: "number",
      Header: "shipment",
      Cell: ({ row: { original } }) => <ShipmentReferenceTag shipment={original} />
    },
    {
      Header: "Pickup",
      accessor: "pickup",
      columns: [
        {
          accessor: "pickup.location", // return {}
          Header: "Location",
          Cell: ({ value: location }) => <LocationSummaryTag location={location} />
        },
        {
          accessor: "pickup.date",
          Header: "Date",
          Cell: ({ value: date }) => (date ? <MomentTag date={date} /> : null)
        }
      ]
    },
    {
      Header: "Delivery",
      accessor: "delivery",
      columns: [
        {
          accessor: "delivery.location", // return {}
          Header: "Location",
          Cell: ({ value: location }) => <LocationSummaryTag location={location} />
        },
        {
          accessor: "delivery.date",
          Header: "Date",
          Cell: ({ value: date }) => (date ? <MomentTag date={date} /> : null)
        }
      ]
    },
    {
      Header: "Total Cost",
      accessor: "costs", // []
      Cell: ({ value: costs = [] }) => {
        return <TotalCostTag costs={costs} currency={currency} />;
      }
    }
  ];

  return (
    <ReactTable
      selectable
      paginate
      maxRows={5}
      shouldShowTablePagination
      onSelectedRows={selectedItems => setSelectedItems(selectedItems)}
      data={shipments}
      columns={columns}
      loading={loading}
    />
  );
};

const InvoiceSelectShipmentsSection = ({ refetchShipments, ...props }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const resetShipments = () => {
    setSelectedItems([]);
    refetchShipments();
  };
  return (
    <>
      <SelectionOverview {...{ ...props, selectedItems, resetShipments }} />
      <IconSegment
        title="Select shipments"
        icon="calculator"
        body={<SelectShipments {...props} {...{ setSelectedItems }} />}
      />
    </>
  );
};

// InvoiceSelectShipmentsSection.propTypes = { ...tabPropTypes };
//#endregion

const InvoiceSelectShipmentsSectionLoader = ({ ...props }) => {
  const { params } = useRoute();
  const currency = get(props, ["invoice", "amount", "currency"], DEFAULT_CURRENCY);
  const invoiceId = params._id;
  const { data = {}, loading, error, refetch: refetchShipments } = useQuery(
    GET_UNINVOICED_SHIPMENTS,
    {
      variables: { invoiceId },
      fetchPolicy: "no-cache"
    }
  );

  if (error) {
    console.error(error);
  }

  const { shipments = [] } = data;

  return (
    <InvoiceSelectShipmentsSection
      {...{ ...props, shipments, loading, currency, refetchShipments }}
    />
  );
};

InvoiceSelectShipmentsSectionLoader.propTypes = { ...tabPropTypes };

export default InvoiceSelectShipmentsSectionLoader;
