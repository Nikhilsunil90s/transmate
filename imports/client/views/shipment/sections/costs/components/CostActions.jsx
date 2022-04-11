/* eslint-disable no-use-before-define */
import React, { useEffect, useState } from "react";
import { Trans } from "react-i18next";

import get from "lodash.get";
import { useApolloClient, useLazyQuery } from "@apollo/client";

// UI
import { Form, Grid, Button, List } from "semantic-ui-react";
import CostOption from "./CostOption.jsx";
import PriceRequestSummaryLoader from "./PriceRequestSummaryLoader.jsx";
import initializeConfirm from "/imports/client/components/modals/confirm";

import { mutate } from "/imports/utils/UI/mutate";
import { generateMessage } from "/imports/client/views/shipment/sections/costs/components/priceRequestGenerateMsg";
import { CREATE_PRICE_REQUEST } from "../utils/queries";
import { SHIPMENT_PRICE_LOOKUP } from "../../../utils/queries-priceLookup";
import useRoute from "/imports/client/router/useRoute.js";

const debug = require("debug")("shipment:costactions");

let i = 0;

const ITEMS_IN_SHORTLIST = 3;

const launchRequest = ({ params, goRoute, client, shipment, showConfirm }) => {
  if (!shipment) return;
  debug("shipment data in call %o", shipment);
  const shipmentId = params._id;

  debug("launching request for %s", shipmentId);

  mutate(
    {
      client,
      query: {
        mutation: CREATE_PRICE_REQUEST,
        variables: {
          type: "spot",
          title: get(shipment, "references.number") || get(shipment, "number"),
          items: [{ shipmentId }]
        }
      },
      errorMsg: "Could not create price request"
    },
    (res = {}) => {
      showConfirm(false);
      const { errors = [], priceRequestId } = res.result || {};
      debug("generated priceRequest %o", res);
      if (priceRequestId) {
        goRoute("priceRequestEdit", { _id: priceRequestId });
      }

      if (errors.length > 0) {
        generateMessage(res);
      }
    }
  );
};

const ShipmentCostActions = ({ ...props }) => {
  const { goRoute, params } = useRoute();
  const client = useApolloClient();
  debug("ShipmentCostActions props", { props });
  const { shipment, shipmentId, lookupResult = {}, refresh } = props;
  const costs = lookupResult.costs || [];
  const haslookupResult = costs.length > 0;
  const baseCurrency = get(lookupResult, "calculationParams.currency") || "EUR";
  const [isShortList, setShortList] = useState(true);

  let costItems = [];
  if (isShortList) {
    costItems = costs.slice(0, ITEMS_IN_SHORTLIST);
  } else {
    costItems = costs;
  }

  const hasMoreResults = costs.length > costItems.length;

  const { showConfirm: showConfirmNew, Confirm: ConfirmNew } = initializeConfirm();

  const launchPricRequest = () => {
    launchRequest({ params, goRoute, client, shipment, showConfirm: showConfirmNew });
  };

  const toggleShortList = () => {
    setShortList(!isShortList);
  };

  return (
    <Form>
      <Grid>
        <Grid.Row>
          <Grid.Column width={10}>
            {haslookupResult ? (
              <Form.Field className="lookupResults">
                <label>
                  <Trans i18nKey="shipment.form.costs.optionTitle" />
                </label>
                <List divided verticalAlign="middle">
                  {costItems.map(cost => {
                    i += 1;
                    return <CostOption key={i} {...{ shipmentId, cost, baseCurrency, refresh }} />;
                  })}
                </List>
                {hasMoreResults && (
                  <a onClick={toggleShortList}>
                    <Trans i18nKey="general.more" />
                  </a>
                )}
                {!isShortList && (
                  <a onClick={toggleShortList}>
                    <Trans i18nKey="general.less" />
                  </a>
                )}
              </Form.Field>
            ) : (
              <Trans i18nKey="shipment.form.costs.empty" />
            )}
          </Grid.Column>
          <Grid.Column width={6} verticalAlign="bottom">
            {shipment.priceRequestId ? (
              [
                <PriceRequestSummaryLoader key="summary" shipmentId={shipmentId} />,
                <Button
                  key="btn"
                  as="a"
                  onClick={() => {
                    goRoute("priceRequestEdit", { _id: shipment.priceRequestId });
                  }}
                  content={<Trans i18nKey="shipment.form.costs.button.view-request" />}
                />
              ]
            ) : (
              <>
                <Button
                  onClick={() => showConfirmNew(true)}
                  content={<Trans i18nKey="shipment.form.costs.button.request" />}
                  data-test="initiatePriceRequest"
                />
                <ConfirmNew
                  content="This action will initiate a price request that can be sent out. Proceed?"
                  onConfirm={launchPricRequest}
                  data-test="confirmNewPriceRequest"
                />
              </>
            )}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Form>
  );
};

const ShipmentCostActionsLoader = props => {
  const { shipment, shipmentId } = props;

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
    skip: !shipmentId,
    fetchPolicy: "no-cache"
  });
  if (lookupError) console.error(lookupError);
  debug("price lookup results %o", {
    data: lookupData,
    loading: lookupLoading,
    error: lookupError
  });
  const lookupResult = lookupData.results || {};
  //#endregion

  useEffect(() => {
    // deferred -> speed up initial page load of the shipment
    if (!shipment?.id) return;
    doPriceLookup();
  }, [doPriceLookup, shipment]);

  return <ShipmentCostActions {...props} lookupResult={lookupResult} />;
};

export default ShipmentCostActionsLoader;
