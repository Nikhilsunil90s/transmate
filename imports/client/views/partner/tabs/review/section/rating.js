/* eslint-disable meteor/no-session */
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { Session } from "meteor/session";

import "./rating.html";
import "/imports/client/components/forms/input/rating.js";

Template.PartnerScoreCard.onCreated(function onCreated() {
  this.score = new ReactiveVar([]);
  Session.set("reload-rating", "initialized");
  const setVar = reactiveVar => {
    return (e, r) => {
      if (!e) {
        reactiveVar.set(r);
      }
    };
  };
  return this.autorun(() => {
    Session.get("reload-rating");
    const { accountId } = this.data;
    const { personal } = this.data;
    return Meteor.call(
      "review.getScore",
      { accountId, personal },
      setVar(this.score)
    );
  });
});

Template.PartnerScoreCard.helpers({
  score() {
    return Template.instance().score.get();
  },
  avg(arr) {
    return (
      (arr || []).reduce((accumulator, currentValue) => {
        return accumulator + Number(currentValue.value);
      }, 0) / arr.length
    ).toFixed(2);
  }
});
