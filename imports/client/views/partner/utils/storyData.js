import pick from "lodash.pick";
import accounts from "/imports/api/_jsonSchemas/fixtures/data.accounts.json";

const VIEWER_ID = "S65957";
const data = accounts[1];
const annotationData = (data.accounts || []).find(
  ({ accountId: a }) => a === VIEWER_ID
);

export const partnerId = data._id;

export const security = {
  canAnnotatePartner: true,
  canBeDeactivated: true,
  canAcceptRejectRequest: false,
  canResendRequest: true,
  canBeReactivated: false
};

export const partner = {
  id: partnerId,
  ...pick(data, "name", "type", "key", "logo", "description", "banner"),
  annotation: pick(annotationData, "coding", "profile", "notes"),
  partnership: (data.partners || []).find(({ accountId: a }) => a === VIEWER_ID)
};
