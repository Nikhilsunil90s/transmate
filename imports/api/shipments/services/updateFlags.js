/* eslint-disable func-names */
import moment from "moment";
import { _ } from "meteor/underscore";
import { oPath } from "/imports/utils/functions/path";

export const updateFlags = {
  "approve-costs": function() {
    const costToApprove = (this.costs || []).some(x => x.forApproval);
    if (!costToApprove) {
      return this.pull({ flags: "approve-costs" });
    }
    return this.push({ flags: "approve-costs" }, true);
  },
  // eslint-disable-next-line consistent-return
  "tracking-failed": function() {
    const trackingActive = oPath(["tracking", "active"], this);
    if (trackingActive) {
      const job = null;
      const hasFlag = (this.flags || []).indexOf("tracking-failed") > -1;
      if (!job && !hasFlag) {
        return this.push({ flags: "tracking-failed" }, true);
      }

      let isFailed = job.status === "failed";
      const isRetrying =
        job.status === "waiting" && oPath(["failures", "length"], job);

      // If a job depleted its maximum number of retries, it is marked as
      // cancelled, not failed
      if (
        job.status === "cancelled" &&
        job.retries &&
        job.retries === job.repeatRetries
      ) {
        isFailed = true;
      }
      if (isFailed || isRetrying) {
        if (!hasFlag) {
          this.push({ flags: "tracking-failed" }, true);
        }
      } else if (hasFlag) {
        this.pull({ flags: "tracking-failed" }, true);
      }
    }
  },
  "eta-late": function() {
    const threshold = 15; // can also be defined in carrier/account settings in the future
    return this.stages().forEach(stage => {
      const plDate = oPath(["dates", "delivery", "arrival", "planned"], stage);
      if (plDate) {
        const planned = moment(plDate);
        const eta = moment(stage.dates.eta);
        const minutes = eta.diff(planned, "minutes");
        if (minutes >= threshold) {
          this.push({ flags: "eta-late" }, true);
        }
        this.pull({ flags: "eta-late" });
      }
    });
  },
  late() {
    let planned;
    let current;
    let minutes;
    const threshold = 10; // can also be defined in carrier/account settings in the future

    // Find current stage (first one where the driver has not arrived yet)
    const currentStage = _.find(this.stages(), stage => {
      return !oPath(["dates", "delivery", "arrival", "actual"], stage);
    });
    if (currentStage) {
      planned = !oPath(
        ["dates", "delivery", "arrival", "planned"],
        currentStage
      );
      if (planned) {
        planned = moment(planned);
        current = moment();
        minutes = current.diff(planned, "minutes");
        if (minutes >= threshold) {
          this.push({ flags: "late" }, true);
        }
      }
    }
  }
};
