/* eslint-disable no-use-before-define */
import { toast } from "react-toastify";
import React from "react";
import { useApolloClient } from "@apollo/client";
import { Trans } from "react-i18next";
import get from "lodash.get";

// UI
import { Button, List, Popup } from "semantic-ui-react";
import CostBadges from "./CostBadges";
import { AccountRatingTag } from "/imports/client/components/tags";
import { sAlertCallback } from "/imports/utils/UI/sAlertCallback";

import { currencyFormat } from "/imports/utils/UI/helpers";

import { SELECT_CARRIER } from "../utils/queries";

const debug = require("debug")("costoptions:ui");

//#region components
/** block to summarize the original currencies */
function buildCarrierTotals(rateCard, baseCurrency) {
  const currenciesTotals = {};

  if (rateCard && Array.isArray(rateCard.costs)) {
    rateCard.costs.forEach(cost => {
      // initiate this currency if it does not exist
      if (!currenciesTotals[cost.total.listCurrency]) currenciesTotals[cost.total.listCurrency] = 0;

      // add value to sum all currencies
      currenciesTotals[cost.total.listCurrency] += cost.total.listValue * 1;
    });
  }
  debug("currenciesTotals %o", currenciesTotals);

  // check if carrier total is in base currency
  const carrierCurrencies = Object.keys(currenciesTotals);

  // if length is 1 and if basecurrency found in list we dont need to show the carrier currencies
  if (carrierCurrencies.length === 1 && carrierCurrencies.includes(baseCurrency)) {
    debug("carrier has same currency");
    return "";
  }

  const s = carrierCurrencies.map(currency => currencyFormat(currenciesTotals[currency], currency));

  return `(${s.join(" + ")})`;
}
const CostOptionPopup = ({ cost }) => {
  const priceRequestNotes = get(cost, "priceRequest.notes");
  return (
    <>
      <h4>
        <Trans i18nKey="shipment.costs.popup.partner" />
      </h4>
      {cost.carrierName}
      {priceRequestNotes && (
        <>
          <h4>
            <Trans i18nKey="shipment.costs.popup.notes" />
          </h4>
          {priceRequestNotes}
        </>
      )}
    </>
  );
};
//#endregion

const CostOption = ({ shipmentId, cost, baseCurrency, refresh }) => {
  const client = useApolloClient();
  const priceRequestNotes = cost.biddingNotes || get(cost, "priceRequest.notes");
  const disablePopup = !priceRequestNotes;
  const cb = (err, res) => {
    sAlertCallback(err, res, { onSuccessCb: refresh, onSuccessMsg: "Carrier selected" });
  };
  function selectOption() {
    client
      .mutate({
        mutation: SELECT_CARRIER,
        variables: {
          shipmentId,
          carrierId: cost.carrierId,
          priceListId: cost.id,
          priceListResult: cost
        }
      })
      .then(({ errors }) => {
        if (errors) throw errors;
        toast.success("Carrier selected");
        if (cb) cb();
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not save carrier");
      });
  }
  return (
    <List.Item>
      <List.Content floated="right">
        <Button
          basic
          content={<Trans i18nKey="shipment.form.costs.button.select-option" />}
          onClick={selectOption}
          data-test="selectCostOptionBtn"
        />
      </List.Content>
      <Popup
        trigger={
          <List.Content>
            <List.Header>
              {cost.carrierName}
              <span style={{ opacity: "50%" }}>{` \u2013 ${cost.title}`}</span>
              <span style={{ float: "right" }}>
                <CostBadges {...{ cost }} />
              </span>
            </List.Header>
            <span className="transportprice">{currencyFormat(cost.totalCost, baseCurrency)}</span>
            <span style={{ opacity: "50%" }}> {buildCarrierTotals(cost, baseCurrency)}</span>
            <span>
              <AccountRatingTag partnerId={cost.carrierId} />
            </span>

            <p>
              {(priceRequestNotes || "").length > 50
                ? `${(priceRequestNotes || "").substring(0, 50)}...`
                : priceRequestNotes}
            </p>
          </List.Content>
        }
        content={<CostOptionPopup {...{ cost }} />}
        hoverable
        position="bottom left"
        wide="very"
        disabled={disablePopup}
      />
    </List.Item>
  );
};

export default CostOption;
