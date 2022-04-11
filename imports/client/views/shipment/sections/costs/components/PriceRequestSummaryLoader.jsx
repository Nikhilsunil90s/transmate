/* eslint-disable no-use-before-define */
import React from "react";
import { useQuery } from "@apollo/client";

import PriceRequestSummary from "./PriceRequestSummary.jsx";
import { GET_PRICE_REQUEST_SUMMARY } from "../utils/queries";

const PriceRequestSummaryLoader = ({ shipmentId }) => {
  const { data = {}, error } = useQuery(GET_PRICE_REQUEST_SUMMARY, { variables: { shipmentId } });
  if (error) {
    console.error({ error });
    return null;
  }
  const { priceRequest } = data;

  return <PriceRequestSummary {...{ priceRequest }} />;
};

export default PriceRequestSummaryLoader;
