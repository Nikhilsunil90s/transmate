import React from "react";
import moment from "moment";
import { useQuery } from "@apollo/client";
import { Trans } from "react-i18next";
import { Loader } from "semantic-ui-react";
import gql from "graphql-tag";
import ItemHeader from "../ItemHeader.jsx";
import useRoute from "/imports/client/router/useRoute.js";

const debug = require("debug")("header");

const PRICE_REQUEST_QUERY = gql`
  query getPriceRequestForHeader($priceRequestId: String!) {
    priceRequest: getPriceRequest(priceRequestId: $priceRequestId) {
      id
      title
      status
      dueDate

      requester
      biddersInRequest
    }
  }
`;

const PriceRequestHeader = () => {
  const { params } = useRoute();
  const priceRequestId = params._id;
  const { data = {}, loading, error } = useQuery(PRICE_REQUEST_QUERY, {
    variables: { priceRequestId }
  });

  debug("header query %o", { data, loading, error });
  const priceRequest = data.priceRequest || {};
  return (
    <ItemHeader>
      {loading ? (
        <Loader active inline size="tiny" />
      ) : (
        <div className="main">
          <div>
            <Trans i18nKey="priceRequest.header.title" values={{ value: priceRequest.title }} />{" "}
          </div>
          <div className="meta center">
            <Trans i18nKey="priceRequest.header.status" values={{ value: priceRequest.status }} />
          </div>{" "}
          {priceRequest.requester ? (
            <div className="meta right">
              <Trans
                i18nKey="priceRequest.header.biddersInRequest"
                values={{ value: priceRequest.biddersInRequest || 0 }}
              />
            </div>
          ) : (
            <div className="meta right">
              <Trans
                i18nKey="priceRequest.header.dueDate"
                values={{ value: moment(priceRequest.dueDate).format("DD/MMM HH:mm") }}
              />
            </div>
          )}
        </div>
      )}
      <div className="aside" />
    </ItemHeader>
  );
};

export default PriceRequestHeader;
