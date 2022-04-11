import React from "react";
import { useQuery } from "@apollo/client";
import { Trans } from "react-i18next";
import gql from "graphql-tag";
import { Loader } from "semantic-ui-react";
import ItemHeader from "../ItemHeader.jsx";
import useRoute from "/imports/client/router/useRoute.js";

const debug = require("debug")("header");

const TENDER_QUERY = gql`
  query getTenderForHeader($tenderId: String!) {
    tender: getTender(tenderId: $tenderId) {
      id
      number
      status
    }
  }
`;

const TenderHeader = () => {
  const { params } = useRoute();
  const tenderId = params._id;
  const { data = {}, loading, error } = useQuery(TENDER_QUERY, {
    variables: { tenderId }
  });

  debug("header query %o", { data, loading, error });
  const tender = data.tender || {};
  return (
    <ItemHeader>
      {loading ? (
        <Loader active inline size="tiny" />
      ) : (
        <div className="main">
          <div>
            <Trans i18nKey="tender.header.title" /> <b>{tender.number}</b>
          </div>
          <div className="meta center">
            <Trans i18nKey="tender.header.status" values={{ value: tender.status }} />
          </div>
        </div>
      )}
      <div className="aside" />
    </ItemHeader>
  );
};

export default TenderHeader;
