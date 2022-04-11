import React from "react";
import moment from "moment";
import LineChart from "/imports/client/components/charts/LineChart";
import { buildPeriods } from "../utils/fn";
import { FuelIndex } from "../fuel.d";

const PERIODS = 12;
const END_AT_YEAR = moment()
  .add(1, "month")
  .year();

const END_AT_MONTH = moment()
  .add(1, "month")
  .month();

const PeriodChart = ({ fuelIndex }: { fuelIndex: FuelIndex }) => {
  const periods = buildPeriods(
    fuelIndex.periods,
    [END_AT_YEAR, END_AT_MONTH, 1],
    PERIODS
  ).sort((a, b) => a.year + a.month - (b.year + b.month));

  return (
    <LineChart
      chartType="bar"
      dataSets={[
        {
          type: "bar",
          label: "Fuel",
          data: periods.map(({ fuel }) => fuel)
        }
        // {
        //   type: "line",
        //   label: "Index",
        //   data: periods.map(({ index }) => index),
        //   yAxisID: "y2"
        // }
      ]}
      labels={periods.map(({ year, month }) => `${year}-${month}`)}
      options={{
        legend: {
          display: false
        },
        plugins: { datalabels: { display: false } },
        scales: {
          x: {
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            title: {
              display: true,
              text: "%"
            }
          }
        }
      }}
    />
  );
};

export default PeriodChart;
