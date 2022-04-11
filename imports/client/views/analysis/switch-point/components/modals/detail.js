/* global Highcharts */
/* eslint-disable */
import React from "react";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Trans } from "react-i18next";

// UI
import "./detail.html";

// FIXME: is this file still used?
Template.SwitchPointAnalysisChart.onRendered(() => {
  // add script for excel export
  $("head").append(
    '<script src="https://files.transmate.eu/cdn/hcharts.js"></script>'
  );
});

Template.SwitchPointAnalysisChart.helpers({
  title() {
    let title;
    const { from, to } = this.lane;
    title = <Trans i18nKey="analysis.switchPoint.details.title" />;
    title += from.countryCode + from.zipCode;
    title += ` - ${to.countryCode}${to.zipCode}`;
    return title;
  },
  chartData() {
    const series = [];
    (this.lane.calculations || []).forEach(item => {
      return series.push({
        name: item.priceList.title,
        data: item.calculation
      });
    });

    // Use Meteor.defer() to craete chart after DOM is ready:
    const intervals = (this.switchPoint.intervals || []).map(step => {
      if (step > 1000) {
        return `${Math.round(step / 100) / 10}k`;
      }
      return step;
    });

    // eslint-disable-next-line consistent-return
    return Meteor.defer(() => {
      // Create standard Highcharts chart with options:
      return Highcharts.chart("detailChart", {
        chart: {
          type: "line"
        },
        title: {
          text: ""
        },
        yAxis: {
          title: {
            text: t("analysis.switchPoint.details.yAxis", {
              value: this.switchPoint.params.currency
            })
          }
        },
        xAxis: {
          categories: intervals,
          title: {
            text: (
              <Trans
                i18nKey="analysis.switchPoint.details.xAxis"
                values={{ value: this.switchPoint.params.uom }}
              />
            )
          }
        },

        // categories:
        colors: ["#483074", "#755da1", "#a791d0", "#afabb6", "#3a3a3a"],
        credits: {
          enabled: false
        },
        series
      });
    });
  }
});
