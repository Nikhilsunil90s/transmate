import { toast } from "react-toastify";
import PropTypes from "prop-types";
import React, { createRef, useState } from "react";
import { Container, Sticky, Header, Menu, Segment, Grid } from "semantic-ui-react";

// ref is not part of "semantic-ui-react", but is a imported module, fix for babel rollup
import { Ref } from "@fluentui/react-component-ref";
import get from "lodash.get";
import { Trans } from "react-i18next";
import { useQuery, useApolloClient } from "@apollo/client";

import { BiddingControl, DataMain } from "../sections";
import { SideMenuShipmentInfo, SideMenuConfirmBids, SideMenuBidderHelp } from "../components";

import { tabPropTypes } from "./_tabProptypes";

import { GET_PRICE_REQUEST_ITEMS, PLACE_SIMPLE_BID } from "../utils/queries";
import { mutate } from "/imports/utils/UI/mutate";

const debug = require("debug")("priceRequest:dataTab");
//#region components
const allMenuItems = [
  {
    key: "biddingControl",
    context: ["bidding"],
    bidType: ["advanced", "simple"],
    i18nKey: "price.request.bidding.title"
  },
  {
    key: "dataSummary",
    context: ["bidding", "viewing"],
    bidType: ["simple"],
    i18nKey: "price.request.data.title"
  },
  {
    key: "dataList",
    context: ["bidding", "viewing"],
    bidType: ["advanced"],
    i18nKey: "price.request.data.title"
  },
  {
    key: "simpleBid",
    context: ["bidding"],
    bidType: ["simple"],
    i18nKey: "price.request.bidSimple.title"
  }
];

let toastId;

/** renders page with bidding items
 * if account == bidder -> bidder section is visible
 * if itemCount == 1 show simple Bid instead of data overview table
 */
const PriceRequestDataTab = ({ priceRequestId, ...props }) => {
  const client = useApolloClient();
  const [activeShipmentId, updateActiveShipmentId] = useState();
  const { items, security = {} } = props;
  const { canBidOnRequest: canBid, isBidder, isOwner } = security;
  const isSimpleBid = get(props, ["priceRequest", "items", "length"]) === 1;
  debug("roles in request", { isBidder, isOwner });

  // hold the bids until confirmation:
  const [placedBids, setPlacedBids] = useState({});
  const [offerPending, setPendingOffer] = useState(false);
  const bidTracker = ({ shipmentId, bid }) => {
    const newBids = { ...placedBids };
    newBids[shipmentId] = bid;

    setPlacedBids(newBids);
    toast.dismiss(toastId);
    toastId = toast.warning(`You have ${Object.keys(newBids).length} bids to confirm`, {
      autoClose: false,
      position: "bottom-center"
    });

    // alert on navigating away:
    window.onbeforeunload = () => true;
  };

  const pendingBids = Object.keys(placedBids);
  const hasBidsToConfirm = pendingBids.length > 0;

  const confirmBids = () => {
    if (!hasBidsToConfirm) return;
    setPendingOffer(true);
    const bidItems = Object.entries(placedBids).map(([shipmentId, bid]) => ({
      shipmentId,
      ...bid
    }));
    mutate(
      {
        client,
        query: {
          mutation: PLACE_SIMPLE_BID,
          variables: { input: { priceRequestId, items: bidItems } }
        }
      },
      data => {
        debug("result from mutation", data);
        setPlacedBids({});
        setPendingOffer(false);
        window.onbeforeunload = null;
        return toast.dismiss(toastId);
      }
    );
  };

  const setActiveShipmentId = newShipmentId => updateActiveShipmentId(newShipmentId);

  // to do  : biddingcotrol always for bidder, canBid will controll button to placebid
  const allProps = {
    ...props,
    isSimpleBid,
    canBid,
    setActiveShipmentId,
    isBidder,
    isOwner,
    bidTracker
  };

  const menuItems = allMenuItems.filter(
    item =>
      item.context.includes(canBid ? "bidding" : "viewing") &&
      item.bidType.includes(isSimpleBid ? "simple" : "advanced")
  );
  const contextRef1 = createRef();

  // shipment that will be rendered on the right info block
  const shipment = (items || []).find(({ id }) => id === activeShipmentId);

  return (
    <Container fluid>
      <Grid columns={2}>
        <Grid.Row columns="equal">
          <Ref innerRef={contextRef1}>
            <Grid.Column>
              {isBidder && (
                <BiddingControl
                  {...allProps}
                  {...{ confirmBids, hasBidsToConfirm, offerPending }}
                />
              )}
              {/* all data & bidding gets loaded in this component*/}
              {<DataMain {...allProps} {...{ confirmBids, hasBidsToConfirm, offerPending }} />}
            </Grid.Column>
          </Ref>
          <Grid.Column computer={5} largeScreen={4} widescreen={4} style={{ zIndex: 99 }}>
            <Sticky pushing context={contextRef1} offset={60}>
              {false && (
                <Segment>
                  <Header as="h3">Jump to</Header>
                  <Menu vertical>
                    {menuItems.map(({ key, i18nKey }) => (
                      <Menu.Item key={key} name={key} as="a" href={`#${key}`}>
                        <Trans i18nKey={i18nKey} />
                      </Menu.Item>
                    ))}
                  </Menu>
                </Segment>
              )}

              {activeShipmentId && <SideMenuShipmentInfo {...{ shipment }} />}
              {isBidder && (
                <SideMenuConfirmBids {...{ confirmBids, hasBidsToConfirm, offerPending }} />
              )}
              {isBidder && <SideMenuBidderHelp />}
            </Sticky>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

PriceRequestDataTab.propTypes = {
  ...tabPropTypes,
  items: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool
};

//#endregion

const PriceRequestDataTabTLoader = ({ ...props }) => {
  const { priceRequestId } = props;

  // gets details of the items (pickup & delivery location, ...)
  const { data: dItems = {}, loading: lItems, error: eItems } = useQuery(GET_PRICE_REQUEST_ITEMS, {
    variables: { priceRequestId }
  });

  if (eItems) debug("data", { eItems });
  const { items = [] } = dItems;
  debug("data items", { items });

  return <PriceRequestDataTab {...props} items={items} loading={lItems} />;
};

export default PriceRequestDataTabTLoader;
