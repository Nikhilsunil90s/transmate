import get from "lodash.get";

// collections:

import { EdiJobs } from "/imports/api/jobs/Jobs";
import { Import } from "/imports/api/imports/Import-shipments";
import { Notification } from "/imports/api/notifications/Notification";

const debug = require("debug")("imports:import-data");

export const shipmentImportProgressUpdate = ({ accountId, userId }) => ({
  accountId,
  userId,
  async update({ importId }) {
    debug("import process progressUpdate called!");
    let completed;
    let failed;

    // This method is called both from an event listener and from the worker server
    // in case of an error
    const count = query => {
      return EdiJobs.find(query, {
        fields: {
          _id: 1
        }
      }).count();
    };
    const importDoc = await Import.first(importId);

    // Prevent updates after the import has been canceled

    const total = get(importDoc, ["total", "shipments"]);
    if (total) {
      [completed, failed] = await Promise.all([
        count({
          "data.importId": importId,
          status: "completed"
        }),

        // completed += 1; // current job will still be running
        count({
          "data.importId": importId,
          status: "failed"
        })
      ]);
      await importDoc.update_async({
        "progress.process": Math.round(((completed + failed) / total) * 100)
      });
      if (completed + failed >= total) {
        debug("import finished, let the user know!");
        Notification.create({
          created: new Date(), // to prevent Meteor.userId error
          userId: importDoc.created.by,
          type: "import",
          event: failed ? "failed" : "done",
          data: {
            count: failed || total,
            total,
            importId
          }
        });
        debug("import finished, set import to done!");
      }
    }
  }
});
