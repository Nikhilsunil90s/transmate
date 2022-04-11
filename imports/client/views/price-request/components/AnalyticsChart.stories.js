import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";

import {
  PriceRequestKPIChart,
  PriceRequestHistoricChart
} from "./AnalyticsChart.jsx";

export default {
  title: "Components/charts/analyticsChart"
};

const analyseData = [
  {
    shipmentId: "eMr34MrxNovnKXEHt",
    carrierName: "RFX INC.",
    kg: 18963,
    totalCostEur: 2606.71782,
    shipmentType: "road",
    km: 1603.185,
    type: "historic 2020-11-24"
  },
  {
    shipmentId: "rwSLDdovEkPNAnjqv",
    carrierName: "RFX INC.",
    kg: 19125,
    totalCostEur: 2639.6,
    shipmentType: "road",
    km: 1809.661,
    type: "historic 2020-12-06"
  },
  {
    shipmentId: "4NacEWY4aYzzsBYTv",
    carrierName: "Summit Trucking",
    kg: 18960,
    totalCostEur: 2692.11488,
    shipmentType: "road",
    km: 1646.828,
    type: "historic 2020-10-11"
  },
  {
    shipmentId: "98HTHnqAArYLB2XSg",
    carrierName: "Transplace Stuttgart, LP",
    kg: 18000,
    totalCostEur: 2652.788376,
    shipmentType: "road",
    km: 1809.661,
    type: "historic 2020-10-08"
  },
  {
    shipmentId: "Zxug3Jpbv3oaDuRD5",
    carrierName: "RFX INC.",
    kg: 18960,
    totalCostEur: 2574.9812,
    shipmentType: "road",
    km: 1603.185,
    type: "historic 2020-11-02"
  },
  {
    shipmentId: "SixZ3y8eBZZWrQoob",
    carrierName: "Transplace Stuttgart, LP",
    kg: 19050,
    totalCostEur: 2638.864256,
    shipmentType: "road",
    km: 1804.577,
    type: "historic 2020-10-11"
  },
  {
    shipmentId: "YwkaxSYPDxud8u89P",
    carrierName: "OL USA",
    kg: 19125,
    totalCostEur: 2901.7538,
    shipmentType: "road",
    km: 1804.577,
    type: "historic 2020-10-04"
  },
  {
    shipmentId: "4EkPMNToQbq2QRbYg",
    carrierName: "RFX INC.",
    kg: 18960,
    totalCostEur: 2548.86375,
    shipmentType: "road",
    km: 1598.101,
    type: "historic 2020-12-06"
  },
  {
    shipmentId: "xaCmBBDkYTucPkQ7j",
    carrierName: "DM Trans LLC",
    kg: 1143,
    totalCostEur: 2522.322,
    shipmentType: "road",
    km: 1651.914,
    type: "historic 2020-09-15"
  },
  {
    shipmentId: "xaCmBBDkYTucPkQ7j",
    carrierName: "DM Trans LLC",
    kg: 1143,
    totalCostEur: 2522.322,
    shipmentType: "road",
    km: null,
    type: "historic 2020-09-15"
  },
  {
    shipmentId: "xaCmBBDkYTucPkQ7j",
    carrierName: "DM Trans LLC",
    kg: 1143,
    totalCostEur: 2522.322,

    type: "historic 2020-09-15"
  },
  {
    type: "simulation",
    shipmentId: "gjz7xNo2fH3QKR6z2",
    shipmentType: "road",
    kg: 18960,
    km: 1809.661,
    totalCostEur: 2155.73683592
  },
  {
    type: "simulation",
    shipmentId: "gjz7xNo2fH3QKR6z2",
    shipmentType: "sea",
    kg: 18960,
    km: 10008.238000000001,
    totalCostEur: 2967.68048688
  },
  {
    shipmentId: "gjz7xNo2fH3QKR6z2",
    totalCostEur: 2560.69,
    type: "bid",
    carrierName: "Total Quality Logistics, LLC",
    kg: 18960,
    km: 1809.661,
    shipmentType: "road"
  }
];

export const analysedataCostPerKmKg = () => {
  return (
    <PageHolder main="AccountPortal">
      <PriceRequestKPIChart {...{ priceRequest: { analyseData } }} />
    </PageHolder>
  );
};

export const analysedataCostPerKmKgEmpty = () => {
  return (
    <PageHolder main="AccountPortal">
      <PriceRequestKPIChart {...{ priceRequest: {} }} />
    </PageHolder>
  );
};

export const analysedataHistoric = () => {
  return (
    <PageHolder main="AccountPortal">
      <PriceRequestHistoricChart {...{ priceRequest: { analyseData } }} />
    </PageHolder>
  );
};
export const analysedataHistoricEmpty = () => {
  return (
    <PageHolder main="AccountPortal">
      <PriceRequestHistoricChart {...{ priceRequest: {} }} />
    </PageHolder>
  );
};
