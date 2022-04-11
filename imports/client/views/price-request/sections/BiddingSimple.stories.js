import React from "react";

import PageHolder from "../../../components/utilities/PageHolder";
import PriceRequestBiddingSimple from "./BiddingSimple.jsx";

export default {
  title: "PriceRequest/Segments/biddingSimple"
};

const dummyProps = {
  chargeLines: [
    {
      id: "test1",
      amount: { unit: "USD", value: 12 },
      name: "test charge 1"
    },
    { id: "test2", name: "test charge 2" }
  ],
  settings: {
    canEditCurrency: true,
    canEditMultiplier: false,
    canEditCharges: false,
    canEditLanes: false,
    canEditLeadTimes: false,
    canCommentRates: true
  }
};
const submitForm = (formData, callback) => {
  console.log(formData);
  callback();
};

export const basicForm = () => {
  const { chargeLines, settings } = dummyProps;
  const settingsMod = {
    ...settings,
    canEditCurrency: true,
    canCommentRates: true
  };

  return (
    <PageHolder main="PriceRequest">
      <PriceRequestBiddingSimple
        onSubmit={submitForm}
        {...{ chargeLines, settings: settingsMod, canBid: true }}
      />
    </PageHolder>
  );
};

export const CurrencyDisabled = () => {
  const { chargeLines, settings } = dummyProps;
  const settingsMod = {
    ...settings,
    canEditCurrency: false
  };
  return (
    <PageHolder main="PriceRequest">
      <PriceRequestBiddingSimple
        onSubmit={submitForm}
        {...{ chargeLines, settings: settingsMod, canBid: true }}
      />
    </PageHolder>
  );
};
export const CommentsDisabled = () => {
  const { chargeLines, settings } = dummyProps;
  const settingsMod = {
    ...settings,
    canCommentRates: false
  };
  return (
    <PageHolder main="PriceRequest">
      <PriceRequestBiddingSimple
        onSubmit={submitForm}
        {...{ chargeLines, settings: settingsMod, canBid: true }}
      />
    </PageHolder>
  );
};
export const hasOffered = () => {
  const { chargeLines, settings } = dummyProps;
  return (
    <PageHolder main="PriceRequest">
      <PriceRequestBiddingSimple
        onSubmit={submitForm}
        {...{ chargeLines, settings, bid: { priceListId: "someId" } }}
      />
    </PageHolder>
  );
};

export const largeForm = () => {
  const { settings } = dummyProps;
  const chargeLines = [];

  [...Array(10).keys()].forEach(l => {
    chargeLines.push({ chargeId: `test${l}`, description: `test charge ${l}` });
  });
  return (
    <PageHolder main="PriceRequest">
      <PriceRequestBiddingSimple
        onSubmit={submitForm}
        {...{ chargeLines, settings }}
      />
    </PageHolder>
  );
};

export const canAddCharges = () => {
  const { chargeLines, settings } = dummyProps;
  const settingsMod = {
    ...settings,
    canEditCurrency: true,
    canCommentRates: true,
    canAddCharges: true
  };
  return (
    <PageHolder main="PriceRequest">
      <PriceRequestBiddingSimple
        onSubmit={submitForm}
        {...{ chargeLines, settings: settingsMod }}
      />
    </PageHolder>
  );
};

export const disabledWithAddedCharges = () => {
  const { chargeLines, settings } = dummyProps;
  const chargeLinesMod = [
    ...chargeLines,
    { id: "test3", name: "test charge 3", isAdded: true }
  ];
  const settingsMod = {
    ...settings,
    canEditCurrency: true,
    canCommentRates: true,
    canAddCharges: true
  };
  return (
    <PageHolder main="PriceRequest">
      <PriceRequestBiddingSimple
        onSubmit={submitForm}
        {...{
          chargeLines: chargeLinesMod,
          settings: settingsMod,
          bid: { priceListId: "someId" }
        }}
      />
    </PageHolder>
  );
};
