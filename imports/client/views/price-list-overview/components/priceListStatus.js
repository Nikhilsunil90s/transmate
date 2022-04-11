import React from "react";
import capitalize from "lodash.capitalize";
import { Trans } from "react-i18next";
import { PriceList } from "/imports/api/pricelists/PriceList.js";

export const getStatusColor = list => {
  if (list.isExpired()) {
    return "red";
  }
  if (list.status === "active") {
    return "green";
  }
  if (list.status === "for-approval") {
    return "orange";
  }
  return "red";
};

export const getStatusText = list => {
  if (list.isExpired()) {
    return <Trans i18nKey="price.list.status.expired" />;
  }

  const { status = "" } = list || {};
  return capitalize(status.replace("-", " "));
};

export const getPriceListStatus = priceList => {
  const list = PriceList.init(priceList);

  const status = getStatusText(list);
  const color = getStatusColor(list);

  return { status, color };
};
