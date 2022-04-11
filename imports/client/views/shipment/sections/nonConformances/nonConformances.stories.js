import React from "react";

import PageHolder from "../../../../components/utilities/PageHolder";
import { NonConformancesSection } from "./NonConformances.jsx";

import fixtures from "/imports/api/_jsonSchemas/fixtures/data.nonConformances.json";
import { traverse } from "/imports/api/zz_utils/services/server/loadFixtures/cleanFixtureData";

const nonConformances = fixtures.map(item => traverse(item));

export default {
  title: "Shipment/Segments/nonConformance"
};

const dummyProps = {
  shipmentId: "test",
  shipment: {
    id: "test",
    nonConformances
  },
  onSave: () => {},
  security: { canEditNonConformances: true }
};

export const basic = () => (
  <PageHolder main="Shipment">
    <NonConformancesSection {...dummyProps} />
  </PageHolder>
);

export const empty = () => {
  return (
    <PageHolder main="Shipment">
      <NonConformancesSection {...dummyProps} />
    </PageHolder>
  );
};
