import { toast } from "react-toastify";
import moment from "moment";

import { CREATE_TENDER } from "./queries";

export async function createTender({ client, t, goRoute }, cb) {
  const defaults = {
    title: `New tender - ${moment().format("YYYY-MM-DD")}`,
    milestones: [
      {
        title: t("tender.milestone.sent"),
        date: moment().format("YYYY-MM-DD")
      },
      {
        title: t("tender.milestone.deadline"),
        date: moment()
          .add(3, "months")
          .format("YYYY-MM-DD")
      }
    ]
  };

  try {
    const { data, errors } = await client.mutate({
      mutation: CREATE_TENDER,
      variables: { data: defaults }
    });
    if (errors) throw errors;
    const tenderId = data.createTender?.id;
    if (!tenderId) throw new Error("No id returned from mutation");

    goRoute("tender", { _id: tenderId, section: "introduction" });
    if (typeof cb === "function") cb();
  } catch (error) {
    console.error({ error });
    toast.error("Could not create tender");
  }
}
