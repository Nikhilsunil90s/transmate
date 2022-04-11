import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";

const debug = require("debug")("chart");

const COLORS = ["#483074", "#755da1", "#a791d0", "#afabb6", "#3a3a3a"];

// https://www.chartjs.org/docs/
const LineChart = ({ dataSets = [], labels = [], options = {}, chartType = "line" }) => {
  const chartContainer = useRef(null);

  debug("chart data %o", { dataSets, labels });

  useEffect(() => {
    if (chartContainer && chartContainer.current) {
      const newChartInstance = new window.Chart(chartContainer.current, {
        type: chartType,
        data: {
          datasets: dataSets.map((ds, i) => ({
            ...ds,
            backgroundColor: COLORS[i]
          })),
          labels
        },
        options: {
          cutoutPercentage: 50,
          plugins: {
            legend: { display: false }
          },
          ...options
        }
      });
      // when component unmounts
      return () => {
        newChartInstance.destroy();
      };
    }
  }, [chartContainer, dataSets]);

  return <canvas ref={chartContainer} />;
};

LineChart.propTypes = {
  dataSets: PropTypes.arrayOf(
    PropTypes.shape({
      data: PropTypes.arrayOf(PropTypes.number)
    })
  ).isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  options: PropTypes.object,
  chartType: PropTypes.string
};

export default LineChart;
