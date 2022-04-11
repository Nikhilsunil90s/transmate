/* eslint-disable no-use-before-define */
import React from "react";
import { Trans } from "react-i18next";
import PropTypes from "prop-types";
import { Button } from "semantic-ui-react";

// UI

import { IconSegment } from "../../../components/utilities/IconSegment";
import PriceRequestDataOverview from "./DataOverview";

import { tabPropTypes } from "../tabs/_tabProptypes";

import { PlaceholderBlock } from "/imports/client/components/utilities";

const PriceRequestDataMain = ({ loading, ...props }) => {
  const { isBidder, confirmBids, offerPending, hasBidsToConfirm } = props;

  return (
    <IconSegment
      name="items"
      title={<Trans i18nKey="price.request.data.title" />}
      body={loading ? <PlaceholderBlock /> : <PriceRequestDataOverview {...props} />}
      footer={
        isBidder ? (
          <Button
            primary
            content="confirm Bid"
            onClick={confirmBids}
            loading={offerPending}
            disabled={!hasBidsToConfirm}
            data-test="confirmBid"
          />
        ) : (
          undefined
        )
      }
    />
  );
};

PriceRequestDataMain.propTypes = {
  ...tabPropTypes,
  loading: PropTypes.bool, // items loading ?
  items: PropTypes.array, // items to show
  setActiveShipmentId: PropTypes.func,
  canBid: PropTypes.bool,
  isBidder: PropTypes.bool,
  isOwner: PropTypes.bool,

  bidtracker: PropTypes.func // in order to add alerts if sth has changed
};

export default PriceRequestDataMain;
