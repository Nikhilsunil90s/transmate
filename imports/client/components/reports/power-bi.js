import { toast } from "react-toastify";
// eslint-disable-next-line import/no-namespace
import * as PowerBI from "powerbi-client";
import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { Template } from "meteor/templating";

import "./power-bi.html";

Template.ReportPowerBI.onCreated(function onCreated() {
  this.config = new ReactiveVar();
  if (this.data.name) {
    const { name, filter } = this.data;
    Meteor.call(
      "analytics.getPowerBIToken",
      {
        report: name,
        filter
      },
      (e, token) => {
        if (e) {
          return toast.error(e.reason);
        }
        return this.config.set({
          ...token,
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
        });
      }
    );
  }
});

Template.ReportPowerBI.onRendered(function onRendered() {
  this.autorun(() => {
    let { config } = Template.currentData();
    if (!config) {
      config = this.config.get();
    }
    if (config) {
      window.powerbi.embed(this.firstNode, config);
    }
  });
});
