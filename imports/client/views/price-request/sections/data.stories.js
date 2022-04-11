import React from "react";
import { Segment } from "semantic-ui-react";
import PageHolder from "../../../components/utilities/PageHolder";
import PriceRequestDataMain from "./DataOverview.jsx";

import { dummyProps } from "../utils/storydata";

export default {
  title: "PriceRequest/Segments/data"
};

export const basic = () => {
  const props = { ...dummyProps, setActiveShipmentId: () => {} };
  return (
    <PageHolder main="PriceRequest">
      <Segment>
        <PriceRequestDataMain {...props} />
      </Segment>
    </PageHolder>
  );
};

export const canEdit = () => {
  const props = { ...dummyProps, setActiveShipmentId: () => {} };
  return (
    <PageHolder main="PriceRequest">
      <Segment>
        <PriceRequestDataMain {...props} />
      </Segment>
    </PageHolder>
  );
};

export const empty = () => {
  const props = { ...dummyProps, setActiveShipmentId: () => {} };
  props.priceRequest.items = [];

  return (
    <PageHolder main="PriceRequest">
      <Segment>
        <PriceRequestDataMain {...props} />
      </Segment>
    </PageHolder>
  );
};

export const table = () => {
  const props = { ...dummyProps, setActiveShipmentId: () => {} };
  return (
    <PageHolder main="PriceRequest">
      <Segment>
        <PriceRequestDataMain {...props} />
      </Segment>
    </PageHolder>
  );
};

export const tableBidder = () => {
  const props = { ...dummyProps, setActiveShipmentId: () => {} };
  props.isBidder = true;

  return (
    <PageHolder main="PriceRequest">
      <Segment>
        <PriceRequestDataMain {...props} />
      </Segment>
    </PageHolder>
  );
};

export const owner = () => {
  const props = { ...dummyProps, setActiveShipmentId: () => {} };
  props.isOwner = true;

  return (
    <PageHolder main="PriceRequest">
      <Segment>
        <PriceRequestDataMain {...props} />
      </Segment>
    </PageHolder>
  );
};
