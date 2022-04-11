import React from "react";
import { Segment } from "semantic-ui-react";

const TenderifyNumber = ({ tenderBid }) => {
  return <Segment padded="very">Bid nr.: {tenderBid.number}</Segment>;
};

export default TenderifyNumber;
