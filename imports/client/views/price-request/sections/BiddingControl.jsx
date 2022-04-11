/* eslint-disable no-use-before-define */
import { useApolloClient } from "@apollo/client";
import React, { useEffect } from "react";
import { Trans } from "react-i18next";
import PropTypes from "prop-types";

// UI
import { Table, Grid } from "semantic-ui-react";
import { IconSegment } from "../../../components/utilities/IconSegment";
import Countdown from "/imports/client/components/countdown/CountDown.jsx";

import StatusRender from "/imports/client/views/price-request/components/PriceRequestStatus";
import { tabPropTypes } from "../tabs/_tabProptypes";

import { UPDATE_BIDDER_TS } from "../utils/queries";
import { mutate } from "/imports/utils/UI/mutate";

const debug = require("debug")("pricerequest:biddingcontrol");

export const BiddingSegment = ({ priceRequest = {}, security = {} }) => {
  const client = useApolloClient();
  const priceRequestId = priceRequest.id;
  const { canPlaceBid } = security || {};
  useEffect(() => {
    // sets the timeStamp for the bidder:
    mutate({ client, query: { mutation: UPDATE_BIDDER_TS, variables: { priceRequestId } } }, debug);
  }, []);

  return (
    <Grid columns={2}>
      <Grid.Column>
        <Table basic>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                <Trans i18nKey="price.request.title" />
              </Table.Cell>
              <Table.Cell>{priceRequest.title}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell collapsing>
                <Trans i18nKey="price.request.bidding.status" />
              </Table.Cell>
              <Table.Cell>
                <StatusRender priceRequest={priceRequest} />
              </Table.Cell>
            </Table.Row>
            {/* {priceListId && (
              <Table.Row>
                <Table.Cell></Table.Cell>
                <Table.Cell>
                  <a
                    href={FlowRouter.path(
                      "priceList",
                      { _id: priceListId },
                      { redirect: FlowRouter.current().path }
                    )}
                  >
                    advanced view
                  </a>
                </Table.Cell>
              </Table.Row>
            )} */}
            {/* {canPlaceBid && (
              <Table.Row>
                <Table.Cell></Table.Cell>
                <Table.Cell>
                  {isSimpleBid && (
                    <a href="#simpleBid">{<Trans i18nKey={"price.request.bidding.jumpToBid"} />}</a>
                  )}

                  {!isSimpleBid && !myPriceListId && (
                    <Button
                      primary
                      onClick={placeBid}
                      content={<Trans i18nKey={"price.request.bidding.placeBid"} />}
                    />
                  )}
                </Table.Cell>
              </Table.Row>
            )} */}
          </Table.Body>
        </Table>
      </Grid.Column>
      <Grid.Column>
        {canPlaceBid && (
          <>
            <h5>
              <Trans i18nKey="price.request.bidding.timeLeft" />
            </h5>
            <Countdown endTime={priceRequest.dueDate} />
          </>
        )}
      </Grid.Column>
    </Grid>
  );
};

/** component gets rendered for the bidder only */
const PriceRequestBidding = ({ ...props }) => {
  const segmentData = {
    name: "biddingControl",
    icon: "gavel",
    title: <Trans i18nKey="price.request.bidding.title" />,
    body: <BiddingSegment {...props} />
  };

  return <IconSegment {...segmentData} />;
};

PriceRequestBidding.propTypes = {
  ...tabPropTypes,
  isSimpleBid: PropTypes.bool
};

export default PriceRequestBidding;
