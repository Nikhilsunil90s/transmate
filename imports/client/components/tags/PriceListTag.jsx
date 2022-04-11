import React from "react";
import { Loader } from "semantic-ui-react";
import { useLazyQuery, gql } from "@apollo/client";
import StatusTag from "./StatusTag";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

const debug = require("debug")("partnertag");

const STATUS_COLORS = { active: "green", "for-approval": "orange" };
const DEFAULT_STATUS_COLOR = "red";

export const GET_PRICELIST_DATA = gql`
  query getPriceListForTag($priceListId: String!) {
    priceList: getPriceList(priceListId: $priceListId) {
      id
      title
      status
    }
  }
`;

export const PriceListTag = ({ priceListId, title, status }) =>
  title ? (
    <div style={{ display: "flex" }}>
      <a
        href={generateRoutePath("priceList", { _id: priceListId, section: "rates" })}
        target="_blank"
        rel="noreferrer"
      >
        {title}
      </a>
      <div style={{ marginLeft: "5px" }}>
        <StatusTag color={STATUS_COLORS[status] || DEFAULT_STATUS_COLOR} text={status} />
      </div>
    </div>
  ) : (
    <a
      href={generateRoutePath("priceList", { _id: priceListId, section: "rates" })}
      target="_blank"
      rel="noreferrer"
    >
      Rate card
    </a>
  );

const PriceListTagLoader = ({ priceListId, title, status }) => {
  const [getInfo, { data = {}, loading, error, called }] = useLazyQuery(GET_PRICELIST_DATA, {
    variables: { priceListId }
  });

  if (error) debug("error in data fetch %o", error);

  if (!title && priceListId && !called) getInfo();
  const priceListTitle = title || data.priceList?.title;

  return loading ? (
    <Loader active inline />
  ) : (
    <PriceListTag
      priceListId={priceListId}
      title={priceListTitle}
      status={status || data.priceList?.status}
    />
  );
};

export default PriceListTagLoader;
