import { addCron } from "../../cronjobs/cron";
import { handleExpiringPriceLists } from "../services/jobFn.handleExpiringPriceLists";

// collections:

Meteor.startup(function startCronNewUsersToSendgrid() {
  addCron({
    name: "check for expriging and expired pricelists",
    cron: "0 0 0 * * *", // every midnight
    job: handleExpiringPriceLists
  });
});
