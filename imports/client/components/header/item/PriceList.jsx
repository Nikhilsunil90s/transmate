import React from "react";
import { useTranslation, Trans } from "react-i18next";
import { useQuery } from "@apollo/client";
import { Loader } from "semantic-ui-react";
import gql from "graphql-tag";
import ItemHeader from "../ItemHeader.jsx";
import useRoute from "/imports/client/router/useRoute.js";

const debug = require("debug")("header");

const PRICELIST_QUERY = gql`
  query getPriceListHeader($priceListId: String!) {
    priceList: getPriceList(priceListId: $priceListId) {
      id
      status
      title
      mode
      expired
    }
  }
`;

const PartnerHeader = () => {
  const { t } = useTranslation();
  const { params } = useRoute();
  const priceListId = params._id;

  const { data = {}, loading, error } = useQuery(PRICELIST_QUERY, {
    variables: { priceListId }
  });
  debug("header query %o", { data, loading, error });

  const priceList = data.priceList || {};
  return (
    <ItemHeader>
      {loading ? (
        <Loader active inline size="tiny" />
      ) : (
        <div className="main">
          <div>
            {priceList.status === "requested" ? (
              <>
                {t("price.list.header.request")} <b>{priceList.title}</b>
              </>
            ) : (
              <>
                {t("price.list.header.item")} <b>{priceList.title}</b>
              </>
            )}
          </div>

          <div className="meta center">
            {!priceList.expired ? (
              <Trans i18nKey="price.list.header.status" values={{ value: priceList.status }} />
            ) : (
              <Trans
                i18nKey="price.list.header.status"
                values={{ value: t("price.list.footer.expired") }}
              />
            )}
          </div>
          <div className="meta right">
            <Trans i18nKey="price.list.header.mode" values={{ value: priceList.mode }} />
          </div>
        </div>
      )}
      <div className="aside" />
    </ItemHeader>
  );
};

export default PartnerHeader;
