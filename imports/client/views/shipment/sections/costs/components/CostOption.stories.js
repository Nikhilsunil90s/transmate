import React from "react";
import { List } from "semantic-ui-react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import CostOption from "./CostOption.jsx";

import { simpleResult } from "/imports/api/pricelists/testing/priceLookupResult";

export default {
  title: "Shipment/Segments/costs/costOption"
};

const dummyProps = {
  shipmentId: "testShipment",
  cost: simpleResult.costs[0],
  baseCurrency: "EUR",
  carrierTotal: { amount: 100, currency: "USD" },
  refresh: () => {}
};

export const basic = () => {
  const props = { ...dummyProps };
  return (
    <PageHolder main="Shipment">
      <List divided verticalAlign="middle">
        <CostOption {...props} />
      </List>
    </PageHolder>
  );
};

export const noBadges = () => {
  const props = { ...dummyProps, cost: simpleResult.costs[1] };
  return (
    <PageHolder main="Shipment">
      <List divided verticalAlign="middle">
        <CostOption {...props} />
      </List>
    </PageHolder>
  );
};
