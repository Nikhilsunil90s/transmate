import React from "react";

import PageHolder from "../../../components/utilities/PageHolder";
import PriceRequestPartners from "./Partners.jsx";

import { dummyProps } from "../utils/storydata";

export default {
  title: "PriceRequest/Segments/partners"
};

export const Owner = () => {
  const props = JSON.parse(JSON.stringify(dummyProps));
  props.security.isOwner = true;
  props.security.isBidder = false;
  props.security.canAddPartners = true;
  return (
    <PageHolder main="PriceRequest">
      <PriceRequestPartners {...props} />
    </PageHolder>
  );
};

export const NoModification = () => {
  const props = JSON.parse(JSON.stringify(dummyProps));
  props.security.canAddPartners = false;
  return (
    <PageHolder main="PriceRequest">
      <PriceRequestPartners {...props} />
    </PageHolder>
  );
};

export const Empty = () => {
  const props = JSON.parse(JSON.stringify(dummyProps));
  props.priceRequest.bidders = [];
  return (
    <PageHolder main="PriceRequest">
      <PriceRequestPartners {...props} />
    </PageHolder>
  );
};
