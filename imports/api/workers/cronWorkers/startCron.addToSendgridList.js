import { addCron } from "../../cronjobs/cron";
import { addToSendgridList } from "../services/jobFn.addToSendgridList";

// collections:

Meteor.startup(function startCronNewUsersToSendgrid() {
  // newJob(EdiJobs, "run.function", { action: "addToSendgridList" })
  //   .repeat({ schedule: EdiJobs.later.parse.text("every 4 hours") })
  //   .save({ cancelRepeats: true });

  addCron({
    name: "Add users to sendgrid markerting list",
    interval: 60 * 60 * 4,
    job: addToSendgridList
  });
});
