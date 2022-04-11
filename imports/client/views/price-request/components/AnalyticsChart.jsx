import React from "react";
import get from "lodash.get";

import { ScatterChart } from "/imports/client/components/charts";
import { leadTimeDays } from "/imports/utils/UI/helpers";

const colors = {
  purpleDark: "#483074",
  purple: "#755da1",
  purpleLight: "#a791d0",
  grey: "#afabb6",
  darkGrey: "#3a3a3a",
  blue: "#3fa2f7"
};
const debug = require("debug")("price-request:chart");

export const PriceRequestKPIChart = ({ priceRequest }) => {
  const analyseData = get(priceRequest, "analyseData", []);
  let hasData = false;
  debug("build chart with %o", analyseData);
  const chartData = {
    datasets: [
      { label: "bid", pointBackgroundColor: colors.blue, data: [] },
      { label: "historic", pointBackgroundColor: colors.grey, data: [] },
      { label: "simulation", pointBackgroundColor: colors.purpleLight, data: [] }
    ],
    options: {
      legend: { display: false },
      scales: {
        x: {
          title: { text: "€/km", display: true },
          ticks: { min: 0 }
        },
        y: {
          title: { text: "€/ton", display: true },
          ticks: { min: 0 }
        }
      },
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

  (analyseData || []).forEach(el => {
    if (el) {
      // debug("check where to place %o", el);
      const { totalCostEur, km, kg, carrierName, type, shipmentType } = el || {};
      const setIndex = chartData.datasets.findIndex(set => type.includes(set.label));

      // debug("place %s data in %o", type, setIndex);
      if (setIndex >= 0) {
        hasData = true;
        chartData.datasets[setIndex].data.push({
          x: totalCostEur / km,
          y: (totalCostEur / kg) * 1000,
          title: `${type} by ${carrierName || shipmentType}`,
          label: `${Math.round(totalCostEur)}€ , ${Math.round((totalCostEur / km) * 100) /
            100} €/km ,  ${Math.round((totalCostEur / kg) * 1000)} €/ton`
        });
      }
    }
  });
  if (hasData)
    return (
      <div className="content">
        <div style={{ width: "100%", height: "100%" }}>
          <ScatterChart {...chartData} />
        </div>
      </div>
    );
  return null;
};

export const PriceRequestHistoricChart = ({ priceRequest }) => {
  let hasData = false;
  const analyseData = get(priceRequest, "analyseData", []);
  debug("build PriceRequestHistoricChart with %o", analyseData);
  const chartData = {
    // top dataset is on top
    datasets: [
      { label: "bid", pointBackgroundColor: colors.blue, data: [] },
      { label: "historic", pointBackgroundColor: colors.grey, data: [] }

      // { label: "simulation", pointBackgroundColor: "blue", data: [] },
    ],
    options: {
      legend: { display: false },
      scales: {
        y: {
          title: { text: "€", display: true },
          ticks: {
            type: "linear",
            min: 0,

            // Include a dollar sign in the ticks
            callback(value) {
              return `${value}€`;
            }
          }
        },
        x: {
          title: { text: "days ago", display: true },
          ticks: {
            type: "linear",
            min: 0,

            // Include days
            callback(value) {
              // debug("x ticks", value, index, values);
              if (365 - value > 0) return `-${365 - value}d`;
              return "";
            }
          }
        }
      },
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

  (analyseData || []).forEach(el => {
    if (el) {
      debug("check where to place %o", el);
      const { totalCostEur, carrierName, type, shipmentType } = el || {};
      const setIndex = chartData.datasets.findIndex(set => type.includes(set.label));
      debug("place %s data in %o", type, setIndex);

      // seems we can just do new date on type...
      const date = type === "bid" ? new Date() : new Date(type);
      const bidDaysAgo = Math.round((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24));
      if (setIndex >= 0) {
        hasData = true;
        debug("place on date :%o, days ago : %o", date, bidDaysAgo);
        chartData.datasets[setIndex].data.push({
          x: 365 - bidDaysAgo,
          y: totalCostEur,
          title: `${type} by ${carrierName || shipmentType}`,
          label: `${Math.round(totalCostEur)}€${bidDaysAgo > 0 ? `, ${bidDaysAgo} days ago` : ""}`
        });
      }
    }
  });

  // return chartData;
  if (hasData)
    return (
      <div className="content">
        <div style={{ width: "100%", height: "100%" }}>
          <ScatterChart {...chartData} />
        </div>
      </div>
    );
  return null;
};

export const PriceRequestAnalyticsChart = ({ priceRequest }) => {
  const chartData = get(priceRequest, ["calculation", "chart"]);

  const datasets = chartData
    .filter(({ data = [] }) => data[0][0] && data[0][1])
    .map(({ data = [], name, color }) => ({
      label: name,
      pointBackgroundColor: color,
      data: data.map(dataPoint => {
        let x;
        let y;
        if (Array.isArray(dataPoint)) {
          [x, y] = dataPoint;
        } else {
          // ! graphql converts [[x,y]] -> [{x,y}]
          ({ 0: x, 1: y } = dataPoint);
        }
        return { x: leadTimeDays(x), y };
      })
    }));
  const options = {
    maintainAspectRatio: false
  };

  return (
    <div className="content">
      <div style={{ width: "100%", height: "100%" }}>
        <ScatterChart {...{ datasets, xLabel: "Lead time", yLabel: "Cost", options }} />
      </div>
    </div>
  );
};

export default PriceRequestAnalyticsChart;
