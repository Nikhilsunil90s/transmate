import React from "react";
import { useTranslation, Trans } from "react-i18next";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { Loader } from "semantic-ui-react";
import ItemHeader from "../ItemHeader.jsx";
import useRoute from "/imports/client/router/useRoute.js";

const debug = require("debug")("header");

const FALLBACK_STATUS = "pending";

const PARTNER_QUERY = gql`
  query getPartnerForHeader($partnerId: String!) {
    partner: getPartner(partnerId: $partnerId) {
      id
      name
      partnership {
        status
      }
    }
  }
`;

const PartnerHeader = () => {
  const { t } = useTranslation();
  const { params } = useRoute();
  const partnerId = params._id;

  const { data = {}, loading, error } = useQuery(PARTNER_QUERY, {
    variables: { partnerId },
    fetchPolicy: "cache-first"
  });
  debug("header query %o", { data, loading, error });

  const partner = data.partner || {};
  return (
    <ItemHeader>
      {loading ? (
        <Loader active inline size="tiny" />
      ) : (
        <div className="main">
          <div>
            {t("partner.header.title")} <b>{partner.name}</b>
          </div>
          <div className="meta center">
            <Trans
              i18nKey="partner.header.status"
              values={{ value: partner.partnership?.status || FALLBACK_STATUS }}
            />
          </div>
        </div>
      )}
    </ItemHeader>
  );
};

export default PartnerHeader;
