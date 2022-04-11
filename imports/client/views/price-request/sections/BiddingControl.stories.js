import React from "react";

import PageHolder from "../../../components/utilities/PageHolder";
import { BiddingSegment } from "./BiddingControl.jsx";
import businessDays from "/imports/api/_jsonSchemas/simple-schemas/_utilities/businessDays.js";
import { dummyProps } from "../utils/storydata";

export default {
  title: "PriceRequest/Segments/BiddingSegment"
};

export const requested = () => {
  dummyProps.priceRequest.status = "requested";
  dummyProps.priceRequest.dueDate = businessDays();
  dummyProps.security.canPlaceBid = true;
  return (
    <PageHolder main="PriceRequest">
      <BiddingSegment {...dummyProps} />
    </PageHolder>
  );
};

export const pastDue = () => {
  dummyProps.priceRequest.status = "requested";
  dummyProps.priceRequest.dueDate = new Date();
  dummyProps.security.canPlaceBid = true;
  return (
    <PageHolder main="PriceRequest">
      <BiddingSegment {...dummyProps} />
    </PageHolder>
  );
};

export const archived = () => {
  dummyProps.priceRequest.status = "archived";
  dummyProps.security.canPlaceBid = false;
  dummyProps.priceRequest.dueDate = businessDays();

  // disable something..

  return (
    <PageHolder main="PriceRequest">
      <BiddingSegment {...dummyProps} />
    </PageHolder>
  );
};
