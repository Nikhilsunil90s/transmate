import { Template } from "meteor/templating";

import "./review.html";
import "./section/rating.js";
import "./modals/review.js";
import "/imports/client/components/modals/modal.js";

Template.PartnerReview.helpers({
  accountId() {
    return "accountId"; // FlowRouter.getParam("_id");
  }
});
