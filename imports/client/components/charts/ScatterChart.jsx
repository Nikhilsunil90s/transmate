/* eslint-disable no-unused-vars */
/* global Chart */
import React, { useRef, useEffect } from "react";
import get from "lodash.get";

const debug = require("debug")("chart");

const pointStyles = [
  "circle",
  "rectRounded",
  "rectRot",
  "triangle",
  "rect",
  "cross",
  "crossRot",
  "dash",
  "line",
  "star"
];

// https://www.chartjs.org/docs/latest/charts/scatter.html
const ScatterChart = ({ datasets = [], xLabel = "", yLabel = "", options = {} }) => {
  const chartContainer = useRef(null);

  const preppedDatasets = datasets.map((dataset, i) => ({
    ...dataset,
    pointStyle: pointStyles[i]
  }));

  useEffect(() => {
    if (chartContainer && chartContainer.current) {
      const newChartInstance = new Chart(chartContainer.current, {
        type: "scatter",
        data: { datasets: preppedDatasets },
        options: {
          tooltips: {
            callbacks: {
              title([{ datasetIndex }], data) {
                // debug(data, a);
                // const { datasetIndex } = a;
                debug(get(data, ["datasets", datasetIndex, "label"]));
                return get(data, ["datasets", datasetIndex, "label"]);
              }
            }
          },
          elements: {
            point: { radius: 8, hoverRadius: 10 }
          },
          scales: {
            y: {
              scaleLabel: {
                display: true,
                labelString: yLabel
              },
              type: "linear",
              ticks: {
                min: 0
              }
            },
            x: {
              scaleLabel: { display: true, labelString: xLabel },
              type: "linear",
              ticks: {
                min: 0
              }
            }
          },
          plugins: {
            legend: { display: false },
            datalabels: {
              display: false
            }
          },
          ...options
        }
      });

      // when component unmounts
      return () => {
        newChartInstance.destroy();
      };
    }
  }, [chartContainer]);

  return <canvas ref={chartContainer} />;
};

export default ScatterChart;
