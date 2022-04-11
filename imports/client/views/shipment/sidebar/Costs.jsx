import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import get from "lodash.get";
import PropTypes from "prop-types";

import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Trans } from "react-i18next";
import { Button, Divider, Label, List, Segment, Header } from "semantic-ui-react";
import { PartnerSelectFieldLoader } from "/imports/client/components/forms/uniforms/PartnerSelect";
import { CurrencyTag } from "/imports/client/components/tags";
import { toggleSidePanel } from "./toggleSidePanel";
import { SHIPMENT_PRICE_LOOKUP } from "../utils/queries-priceLookup";
import { SELECT_CARRIER, CREATE_PRICE_REQUEST } from "../sections/costs/utils/queries";
import { ConfirmComponent } from "/imports/client/components/modals/confirm";
import useRoute from "/imports/client/router/useRoute";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

const debug = require("debug")("shipment:sidebar");

const GET_SHIPMENT = gql`
  query getShipmentSideBarCosts($shipmentId: String!) {
    shipment: getShipment(shipmentId: $shipmentId) {
      id
      priceRequestId
      carrierIds
    }
  }
`;

const ManualySelectPartner = ({ selectPriceList }) => {
  const [confirmState, setConfirmState] = useState({ show: false });
  const showConfirm = show => setConfirmState({ ...confirmState, show });

  const onSelectPartner = partnerId => setConfirmState({ show: true, partnerId });
  const onConfirm = () => {
    const carrierId = confirmState.partnerId;
    selectPriceList({ variables: { carrierId } });
    toggleSidePanel();
  };

  return (
    <>
      <h4>
        <Trans i18nKey="shipment.carrier-select.manual" />
      </h4>
      <Divider clearing />
      <Segment as="section" padded>
        <List>
          <List.Item
            content={
              <>
                <p>
                  <Trans i18nKey="shipment.carrier-select.manual-info" />
                </p>
                <PartnerSelectFieldLoader
                  options={{ types: ["carrier", "provider"] }}
                  onChange={onSelectPartner}
                />
              </>
            }
          />
        </List>
        <ConfirmComponent {...confirmState} showConfirm={showConfirm} onConfirm={onConfirm} />
      </Segment>
    </>
  );
};

const PriceRequestCard = ({ shipmentId, calculationParams }) => {
  const { goRoute } = useRoute();
  const { from, to, goods, equipments, serviceLevel } = calculationParams;
  const [launchRequest, { loading }] = useMutation(CREATE_PRICE_REQUEST, {
    variables: {
      type: "spot",
      items: [
        {
          shipmentId,
          params: { from, to, goods, equipments, serviceLevel }
        }
      ]
    },
    onCompleted(data = {}) {
      debug("create price request res", data);
      if (data.result?.priceRequestId) {
        goRoute("priceRequestEdit", { _id: data.result?.priceRequestId });
        toast.success("Price request created");
      } else {
        toast.error("Something went wrong");
      }
    },
    onError(error) {
      console.error(error);
    }
  });

  const { data = {}, error } = useQuery(GET_SHIPMENT, {
    variables: { shipmentId },
    fetchPolicy: "cache-only",
    skip: !shipmentId
  });
  if (error) console.error(error);

  const shipment = data.shipment || {};

  return (
    <Segment as="section" className="get-price">
      <List>
        <List.Item>
          <List.Content>
            <h3>
              <Trans i18nKey="shipment.carrier-select.request.title" />
            </h3>
            {shipment.priceRequestId ? (
              <>
                <Trans i18nKey="shipment.carrier-select.request.infoCreated" />:{" "}
                <a
                  href={generateRoutePath("priceRequestEdit", { _id: shipment.priceRequestId })}
                  onClick={toggleSidePanel}
                >
                  <Trans i18nKey="shipment.carrier-select.request.track" />
                </a>
              </>
            ) : (
              <>
                <p>
                  <Trans i18nKey="shipment.carrier-select.request.info" />
                </p>
                <Button
                  primary
                  content={<Trans i18nKey="shipment.carrier-select.request.buttonSpot" />}
                  onClick={() => {
                    launchRequest();
                    toggleSidePanel();
                  }}
                  loading={loading}
                />
                {/* <Button content={<Trans i18nKey={"shipment.carrier-select.request.buttonMissing"} />} /> */}
              </>
            )}
          </List.Content>
        </List.Item>
      </List>
    </Segment>
  );
};

const CostOptionCard = ({ selectPriceList, option, baseCurrency }) => (
  <Segment as="section" padded className="price-list">
    <List>
      <List.Item
        onClick={() =>
          selectPriceList({
            variables: {
              carrierId: option.carrierId,
              priceListId: option.id,
              priceListResult: option
            }
          })
        }
      >
        <List.Content>
          <h3>{option.carrierName}</h3>
        </List.Content>
        <div className="transportprice">
          <CurrencyTag value={option.totalCost || 0} currency={baseCurrency} />
        </div>
        <p>{option.title}</p>
        <Divider clearing />
        {option.bestCost && (
          <Label
            color="blue"
            className="col"
            icon="money"
            content={<Trans i18nKey="shipment.carrier-select.bestPrice" />}
          />
        )}
        {option.bestLeadTime && (
          <Label color="blue" className="col" icon="clock" content="Best Lead-time" />
        )}
        {option.leadTime && (
          <Label
            icon="clock"
            className="col"
            content={
              <>
                {option.leadTime.hours || " - "}
                {<Trans i18nKey="shipment.carrier-select.leadTimeDays" />}
              </>
            }
          />
        )}
        {option.serviceLevel && <Label content={option.serviceLevel} />}
      </List.Item>
    </List>
  </Segment>
);

CostOptionCard.typeDefs = {
  id: PropTypes.string,
  title: PropTypes.string,
  carrierId: PropTypes.string,
  carrierName: PropTypes.string,
  bestCost: PropTypes.bool,
  bestLeadTime: PropTypes.bool,
  totalCost: PropTypes.float,
  leadTime: PropTypes.object
};

const ShipmentCostsSidebar = () => {
  const { params } = useRoute();
  const shipmentId = params._id;
  const [selectPriceList] = useMutation(SELECT_CARRIER, { variables: { shipmentId } });
  //#region price lookup
  const [
    doPriceLookup,
    { data: lookupData = {}, error: lookupError, loading: lookupLoading }
  ] = useLazyQuery(SHIPMENT_PRICE_LOOKUP, {
    variables: {
      input: {
        shipmentId,
        options: {
          resetCarrier: true,
          resetPriceList: true,
          resetServiceLevel: true
        }
      }
    },
    fetchPolicy: "no-cache"
  });
  if (lookupError) console.error(lookupError);
  debug("price lookup results %o", {
    data: lookupData,
    loading: lookupLoading,
    error: lookupError
  });
  const lookupResult = lookupData.results || {};
  const baseCurrency = get(lookupResult, "calculationParams.currency") || "EUR";
  const calculationParams = lookupResult.calculationParams || {};
  //#endregion

  useEffect(() => {
    doPriceLookup();
  }, []);
  return (
    <>
      <Header as="h4">
        <Trans i18nKey="shipment.carrier-select.quick" />{" "}
      </Header>
      <Divider clearing />

      {(lookupResult.costs || []).map((option, i) => (
        <CostOptionCard key={i} {...{ option, baseCurrency, selectPriceList }} />
      ))}
      <PriceRequestCard shipmentId={shipmentId} calculationParams={calculationParams} />
      <ManualySelectPartner shipmentId={shipmentId} selectPriceList={selectPriceList} />
    </>
  );
};

export default ShipmentCostsSidebar;
