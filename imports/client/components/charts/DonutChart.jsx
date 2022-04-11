/* eslint-disable no-unused-vars */
/* global Chart, ChartDataLabels */
import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";

const debug = require("debug")("chart");

const COLORS = ["#483074", "#755da1", "#a791d0", "#afabb6", "#3a3a3a"];

// https://www.chartjs.org/docs/
const DonutChart = ({ data = [], labels = [], options = {} }) => {
  const chartContainer = useRef(null);

  const total = data.reduce((acc, cur) => {
    const sum = acc + cur;
    return sum;
  }, 0);

  debug("chart data %o", { data, labels });

  useEffect(() => {
    if (chartContainer && chartContainer.current) {
      const newChartInstance = new Chart(chartContainer.current, {
        type: "doughnut",
        plugins: [ChartDataLabels],
        data: {
          datasets: [
            {
              data,
              backgroundColor: COLORS,
              datalabels: { anchor: "center" }
            }
          ],
          labels
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutoutPercentage: 50,
          plugins: {
            legend: { display: false },
            datalabels: {
              // Change options for ALL labels of THIS CHART
              backgroundColor(context) {
                return context.dataset.backgroundColor;
              },
              color: "white",
              font: { weight: "bold" },
              formatter(value, context) {
                return context.chart.data.labels[context.dataIndex];
              },
              display(context) {
                const index = context.dataIndex;
                const value = context.dataset.data[index];
                return value / total > 0.2; // only show labels for >20%
              }
            }
          }
        }
      });
      // when component unmounts
      return () => {
        newChartInstance.destroy();
      };
    }
  }, [chartContainer, data]);

  return <canvas ref={chartContainer} id="donutChart" />;
};

DonutChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  options: PropTypes.object
};

export default DonutChart;
