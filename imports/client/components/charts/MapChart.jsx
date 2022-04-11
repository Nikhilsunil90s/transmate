/* eslint-disable no-unused-vars */
/* global Chart, ChartDataLabels, ChartGeo */
import React, { useRef, useEffect, useState } from "react";

const debug = require("debug")("chart");

const COLORS = ["#483074", "#755da1", "#a791d0", "#afabb6", "#3a3a3a"];

// NOT USED IN PRODUCTION!!!

// fetch('https://unpkg.com/world-atlas/countries-10m.json')

// https://www.chartjs.org/docs/
const MapChart = ({ locations = [], options = {} }) => {
  const chartContainer = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  debug("chart data %o", locations);

  useEffect(() => {
    if (chartContainer && chartContainer.current) {
      (async function drawChart() {
        const res = await fetch("https://unpkg.com/world-atlas/countries-110m.json");
        const mapData = await res.json();

        const countries = ChartGeo.topojson.feature(mapData, mapData.objects.countries).features;
        const newChartInstance = new Chart(chartContainer.current, {
          type: "bubbleMap",
          data: {
            labels: locations.map(l => l.name),
            datasets: [
              {
                label: "Countries",
                outline: countries,
                outlineBorderWidth: 2,
                backgroundColor: "#483074",
                data: locations
              }
            ]
          },
          responsive: true,
          options: {
            showOutline: true,
            plugins: {
              legend: { display: false }
            },
            scales: {
              xy: { projection: "equalEarth" },
              r: { size: [5, 20] }
            }
          }
        });
        setChartInstance(newChartInstance);
      })();
    }
  }, [chartContainer, locations]);

  return <canvas ref={chartContainer} />;
};

export default MapChart;
