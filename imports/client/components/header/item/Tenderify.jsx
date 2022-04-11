import React from "react";
import { useQuery } from "@apollo/client";
import { Trans } from "react-i18next";
import gql from "graphql-tag";
import { Loader } from "semantic-ui-react";
import ItemHeader from "../ItemHeader.jsx";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("header");

const TENDER_BID_QUERY = gql`
  query getTenderBidForHeader($tenderBidId: String!) {
    tenderBid: getTenderBid(tenderBidId: $tenderBidId) {
      id
      number
      status
    }
  }
`;

const TenderBidHeader = () => {
  const {
    params: { _id: tenderBidId }
  } = useRoute();
  const { data = {}, loading, error } = useQuery(TENDER_BID_QUERY, {
    variables: { tenderBidId },
    fetchPolicy: "cache-only"
  });

  debug("header query %o", { tenderBidId, data, loading, error });
  const tenderBid = data.tenderBid || {};
  return (
    <ItemHeader>
      {loading ? (
        <Loader active inline size="tiny" />
      ) : (
        <div className="main">
          <div>
            <Trans i18nKey="tender.header.title" /> <b>{tenderBid.number}</b>
          </div>
          <div className="meta center">
            {tenderBid.status && (
              <Trans i18nKey="tender.header.status" values={{ value: tenderBid.status }} />
            )}
          </div>
        </div>
      )}
      <div className="aside" />
    </ItemHeader>
  );
};

export default TenderBidHeader;
