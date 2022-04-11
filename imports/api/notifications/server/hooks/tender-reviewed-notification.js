import { _ } from "meteor/underscore";
import { JobManager } from "/imports/utils/server/job-manager.js";
import { Notification } from "/imports/api/notifications/Notification";

JobManager.on("tender.reviewed", "Notification", async notification => {
  const tender = notification.object;
  const { i, priceList } = notification.info;
  const priceListDoc = _.findWhere(tender.packages[i].priceLists, priceList);
  if (!priceListDoc) {
    return;
  }
  await Notification.create({
    userId: priceListDoc.added.by,
    type: "tender",
    event: priceListDoc.status,
    data: {
      tenderId: tender.id,
      number: tender.number,
      title: tender.title
    }
  });
  // eslint-disable-next-line consistent-return
  return "done";
});
