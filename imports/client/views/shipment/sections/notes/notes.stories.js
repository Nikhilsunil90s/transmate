import React from "react";
import faker from "faker";

import PageHolder from "../../../../components/utilities/PageHolder";
import ShipmentNotes from "./Notes.jsx";

export default {
  title: "Shipment/Segments/notes"
};

const dummyProps = {
  shipment: {
    _id: "test",
    notes: {
      BookingNotes: faker.lorem.paragraph(),
      PlanningNotes: faker.lorem.paragraph(),
      LoadingNotes: faker.lorem.paragraph(),
      UnloadingNotes: faker.lorem.paragraph(),
      OtherNotes: faker.lorem.paragraph()
    }
  },
  security: { canEditNotes: true },
  onSave(data, cb) {
    console.log(data);
    // eslint-disable-next-line no-unused-expressions
    cb && cb();
  }
};

export const basic = () => (
  <PageHolder main="Shipment">
    <ShipmentNotes {...dummyProps} />
  </PageHolder>
);

export const locked = () => {
  const props = {
    ...dummyProps,
    security: { canEditNotes: false }
  };
  return (
    <PageHolder main="Shipment">
      <ShipmentNotes {...props} />
    </PageHolder>
  );
};

export const withCostParams = () => {
  const props = {
    ...dummyProps,
    shipment: {
      ...dummyProps.shipment,
      costParams: {
        customsClearance: true,
        freeDays: { condition: "some condition here" }
      }
    },
    security: { canEditNotes: false }
  };

  return (
    <PageHolder main="Shipment">
      <ShipmentNotes {...props} />
    </PageHolder>
  );
};

export const empty = () => {
  dummyProps.shipment.notes = {};
  return (
    <PageHolder main="Shipment">
      <ShipmentNotes {...dummyProps} />
    </PageHolder>
  );
};
