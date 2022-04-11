import { toast } from "react-toastify";
import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";

// eslint-disable-next-line import/no-namespace
import * as PowerBI from "powerbi-client";

import { Template } from "meteor/templating";

import "./analysis.html";

Template.CustomAnalysis.onCreated(function onCreated() {
  this.powerBiConfig = new ReactiveVar();
  return this.autorun(() => {
    const { config } = Template.currentData();
    if (!config) {
      return;
    }
    const { groupId, reportId, identities } = config;
    Meteor.call(
      "analytics.custom.getPowerBIToken",
      { groupId, reportId, identities },
      (e, r) => {
        if (e) {
          return toast.error(e.reason);
        }
        return this.powerBiConfig.set(r);
      }
    );
  });
});

Template.CustomAnalysis.helpers({
  powerBi() {
    let embedConfig;
    const config = Template.instance().powerBiConfig.get();
    if (config != null ? config.accessToken : undefined) {
      embedConfig = {
        ...config,
        type: "report",
        tokenType: PowerBI.models.TokenType.Embed,
        permissions: PowerBI.models.Permissions.All,
        settings: {
          filterPaneEnabled: true,
          navContentPaneEnabled: true,
          localeSettings: {
            language: "en",
            formatLocale: "en"
          }
        }
      };
      window.powerbi.embed(
        document.getElementById("powerbi-container"),
        embedConfig
      );
    }
  }
});
