import { TenderDetail } from "/imports/api/tenders/TenderDetail";

export const stepManager = async tender => {
  let steps;

  if (tender) {
    steps = ["general"];
    if (tender.requirements != null) {
      steps.push("requirements");
    }
    if (tender.scope != null) {
      steps.push("scope");
    }
    const cursor = await TenderDetail.find({
      tenderId: tender._id
    });
    const detailCount = await cursor.count();

    if (detailCount > 0) {
      steps.push("data");
    }
    if (tender.packages != null) {
      steps.push("profile");
      if (tender.status === "open") {
        steps.push("bidding");
      }
    }
    return tender.update({ steps });
  }
  return null;
};
