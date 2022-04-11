/* eslint-disable meteor/no-session */
import { toast } from "react-toastify";
import { Template } from "meteor/templating";
import { $ } from "meteor/jquery";
import { Session } from "meteor/session";
import { add as addReview } from "/imports/api/reviews/methods.js";

import "./review.html";
import "/imports/client/components/forms/input/calendar";

import moment from "moment";

Template.PartnerReviewModal.onRendered(function onRendered() {
  this.$(".ui.form").form({
    on: "change",
    inline: true,
    fields: {
      from: {
        identifier: "period.from",
        rules: [
          {
            type: "empty",
            prompt: "this field may not be left empty"
          }
        ]
      },
      to: {
        identifier: "period.to",
        rules: [
          {
            type: "empty",
            prompt: "this field may not be left empty"
          }
        ]
      }
    }
  });
});

Template.PartnerReviewModal.events({
  "click .approve": function submitForm(event, templateInstance) {
    return templateInstance.$(".ui.form").submit();
  },
  "submit .form": function saveRating(event, templateInstance) {
    let data;
    event.preventDefault();
    const result = $(".ui.rating").rating("get rating");
    if (result) {
      data = {
        subjectId: "test", // FlowRouter.getParam("_id"),
        period: {
          from: moment(
            $('input[name="period.from"]').attr("value"),
            "YYYY-MM-DD"
          ).toDate(),
          to: moment(
            $('input[name="period.to"]').attr("value"),
            "YYYY-MM-DD"
          ).toDate()
        },
        score: [
          {
            category: "safety",
            item: "safety question 1",
            score: result[0]
          },
          {
            category: "quality",
            item: "quality question 1",
            score: result[1]
          },
          {
            category: "quality",
            item: "quality question 2",
            score: result[2]
          },
          {
            category: "quality",
            item: "quality question 3",
            score: result[3]
          },
          {
            category: "cost",
            item: "cost question 1",
            score: result[4]
          },
          {
            category: "cost",
            item: "cost question 2",
            score: result[5]
          },
          {
            category: "performance",
            item: "performance question 1",
            score: result[6]
          },
          {
            category: "performance",
            item: "performance question 2",
            score: result[7]
          },
          {
            category: "performance",
            item: "performance question 3",
            score: result[8]
          },
          {
            category: "performance",
            item: "performance question 4",
            score: result[9]
          }
        ]
      };
      addReview.call({ data }, err => {
        if (err) {
          return toast.error(err.reason);
        }
        Session.set("reload-rating", true);
        return $(templateInstance.firstNode).modal("hide");
      });
    }
  }
});
