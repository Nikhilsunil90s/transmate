import { Meteor } from "meteor/meteor";
import { ImportData } from "../ImportData";
import { EdiJobs } from "../../jobs/Jobs";

Meteor.publish("importData", function publish(importId) {
  check(importId, String);
  if (!this.userId) {
    return this.ready();
  }
  return ImportData.find(importId);
});

Meteor.publish("importData.items", function publish(importId, viewErrors) {
  check(importId, String);
  check(viewErrors, Match.Optional(Boolean));
  if (!this.userId) {
    return this.ready();
  }
  let errorFilter;
  if (viewErrors === false) {
    errorFilter = { status: { $ne: "failed" } };
  }
  if (viewErrors === true) {
    errorFilter = { status: "failed" };
  }

  return EdiJobs.find(
    { "data.importId": importId, ...errorFilter },
    { fields: { data: 1, status: 1, result: 1, failures: 1, log: 1 } }
  );
});
