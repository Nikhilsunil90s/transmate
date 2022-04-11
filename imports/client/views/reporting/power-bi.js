import { Meteor } from "meteor/meteor";

import { toast } from "react-toastify";
// eslint-disable-next-line import/no-namespace
import * as PowerBI from "powerbi-client";
import { ReactiveVar } from "meteor/reactive-var";
import { Template } from "meteor/templating";

// TODO [$6130a08837762e00094fd3de]:import { FlowRouter } from "meteor/kadira:flow-router";

import "./power-bi.html";

// eslint-disable-next-line func-names
Template.AnalyticsPowerBI.onCreated(function() {
  this.powerBiConfig = new ReactiveVar();
  return this.autorun(() => {
    // const report = FlowRouter.getParam("section") || "shipments";
    const report = null;
    return Meteor.call("analytics.getPowerBIToken", { report }, (e, r) => {
      if (e) {
        return toast.error(e.reason);
      }
      return this.powerBiConfig.set(r);
    });
  });
});

Template.AnalyticsPowerBI.helpers({
  tabs() {
    return [
      "shipments",
      "invoices",
      "accrual",
      "service",
      "profile",
      "tenderify"
    ];
  },
  tabActive(tab) {
    // section = FlowRouter.getParam("section")
    const section = null;

    if (tab === section) {
      return "active";
    }
    return "";
  },
  tabLabel(tab) {
    return tab;

    // return <Trans i18nKey={`dashboard.tabs.${tab}`} />;
  },
  // eslint-disable-next-line consistent-return
  powerBiConfig() {
    const config = Template.instance().powerBiConfig.get();
    if (config && config.accessToken) {
      return {
        ...config,
        type: "report",
        tokenType: PowerBI.models.TokenType.Embed,
        permissions: PowerBI.models.Permissions.All,
        settings: {
          filterPaneEnabled: true,
          navContentPaneEnabled: false,
          localeSettings: {
            language: "en",
            formatLocale: "en"
          }
        }
      };
    }
  }
});
