import React, { useEffect } from "react";
import { Meteor } from "meteor/meteor";

const debug = require("debug")("GeoChart");

const GeoChart = ({ locations = [] }) => {
  useEffect(() => {
    if (!locations.length > 0 || !window.google?.charts) return; // no empty plot
    window.google.charts.load("current", {
      packages: ["geochart"],
      mapsApiKey: Meteor.settings.public.MAPS_API
    });

    const rows = [["Lat", "Long", "Color", "Size"]];
    locations.forEach(item => {
      if (item.location && item.location.lat && item.location.lng) {
        rows.push([item.location.lat, item.location.lng, 1, 1]);
      }
    });

    debug("show rows on chart...", rows);
    function drawMarkersMap() {
      const data = window.google.visualization.arrayToDataTable(rows);

      const options = {
        displayMode: "markers",
        height: 300,
        keepAspectRatio: true,
        legend: "none",
        sizeAxis: {
          minValue: 1,
          maxValue: 2,
          minSize: 5,
          maxSize: 6
        },
        colorAxis: {
          colors: ["#483074", "#483074"]
        },
        magnifyingGlass: {
          enable: true
        },
        tooltip: { trigger: "none" }
      };

      const container = document.getElementById("GeoChart");
      if (!container) return null;
      const chart = new window.google.visualization.GeoChart(container);
      return chart.draw(data, options);
    }

    window.google.charts.setOnLoadCallback(drawMarkersMap);
  }, [locations]);

  return <div id="GeoChart" />;
};

export default GeoChart;
