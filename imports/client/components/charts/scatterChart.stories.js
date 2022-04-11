import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import ScatterChart from "./ScatterChart.jsx";

export default {
  title: "Components/charts/scatterChart"
};

const debug = require("debug")("chart:demo");

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

const dummyProps = {
  datasets: [
    {
      label: "Data set 1",
      data: [
        {
          x: 50,
          y: 0
        }
      ]
    },
    {
      label: "Data set 2",
      data: [
        {
          x: 10,
          y: 20
        }
      ]
    },
    {
      label: "Data set 3",
      data: [
        {
          x: 20,
          y: 50
        }
      ]
    }
  ],
  xLabel: "X-axis",
  yLabel: "Y-axis"
};
export const simple = () => {
  const props = { ...dummyProps };
  return (
    <PageHolder main="AccountPortal">
      <ScatterChart {...props} />
    </PageHolder>
  );
};

const costPerKmKgDataSet = analyseArray => {
  debug("build chart with %o", analyseArray);
  const chartData = {
    datasets: [
      { label: "historic", pointBackgroundColor: "grey", data: [] },
      { label: "simulation", pointBackgroundColor: "blue", data: [] },
      { label: "bid", pointBackgroundColor: "red", data: [] }
    ],
    xLabel: "€/km",
    yLabel: "€/kg",
    options: {
      legend: { display: false },
      tooltips: {
        callbacks: {
          title([{ datasetIndex, index }], { datasets }) {
            debug("title", { datasetIndex, index }, datasets);

            return `${datasets[datasetIndex].data[index].title} `;
          },
          label({ datasetIndex, index }, { datasets }) {
            debug("label", { datasetIndex, index }, { datasets });

            // slightly different structure,
            return `${datasets[datasetIndex].data[index].label} `;
          }
        }
      }
    }
  };

  analyseArray.forEach(el => {
    if (el) {
      debug("check where to place %o", el);
      const { totalCostEur, km, kg, carrierName, type, shipmentType } =
        el || {};
      const setIndex = chartData.datasets.findIndex(set =>
        type.includes(set.label)
      );
      debug("place %s data in %o", type, setIndex);
      if (setIndex >= 0)
        chartData.datasets[setIndex].data.push({
          x: totalCostEur / km,
          y: totalCostEur / kg,
          title: `${type} by ${carrierName ||
            shipmentType} for ${totalCostEur}`,
          label: `${Math.round((totalCostEur / km) * 100) /
            100} €/km and  ${Math.round((totalCostEur / kg) * 100) / 100} €/kg`
        });
    }
  });

  return chartData;
};

export const analysedataCostPerKmKg = () => {
  const props = costPerKmKgDataSet(analyseData);

  return (
    <PageHolder main="AccountPortal">
      <ScatterChart {...props} />
    </PageHolder>
  );
};
