import React from "react";
import { Trans } from "react-i18next";
import { PriceRequestEvaluation } from "/imports/utils/functions/addInfoToPriceRequest";
import { Popup } from "semantic-ui-react";

const debug = require("debug")("priceRequest:components:status");

const StatusRender = ({ priceRequest = {} }) => {
  // const { status, color } = getPriceRequestStatus(doc);
  const { messageType, to, color } = new PriceRequestEvaluation(priceRequest).statusMessage();
  debug("StatusRender %o", { priceRequest, messageType, to, color });
  return (
    <Popup
      position="bottom center"
      className="tip"
      content={<Trans i18nKey={`price.request.table.description.${to}.${messageType}`} />}
      trigger={
        <a data-test="priceRequestStatus">
          <span
            style={{ position: "relative", top: "2px" }}
            className={`ui ${color} empty horizontal circular label`}
          />
          {messageType}
        </a>
      }
    />
  );
};

export default StatusRender;
