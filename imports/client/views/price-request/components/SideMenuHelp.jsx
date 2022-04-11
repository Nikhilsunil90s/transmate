import React from "react";
import { Message } from "semantic-ui-react";

const BidderHelp = () => (
  <Message
    icon="info"
    info
    header="How to bid"
    content={
      <>
        <p>Learn more how to bid and the bidding process in Transmate. Access the help section</p>
        <a
          href="https://www.transmate.eu/help/bidding-on-spot-rate-requests"
          target="_blank"
          rel="noopener noreferrer"
        >
          go to help section
        </a>
      </>
    }
  />
);

export default BidderHelp;
