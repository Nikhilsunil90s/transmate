import { CheckTenderifySecurity } from "/imports/utils/security/checkUserPermissionsForTenderify";

export const initializeSecurity = ({ tenderBid, context }) => {
  const { accountId, userId } = context;
  const srv = new CheckTenderifySecurity({ tenderBid }, { accountId, userId });
  srv.setContext(context);

  return {
    isOwner: srv.role.isOwner,
    userRole: srv.role.userRole,
    canRelease: srv.can({ action: "canRelease" }).check(),
    canSetBackToDraft: srv.can({ action: "canSetBackToDraft" }).check(),
    canSetToReview: srv.can({ action: "canSetToReview" }).check(),
    canBeClosed: srv.can({ action: "canBeClosed" }).check(),
    canBeCanceled: srv.can({ action: "canBeCanceled" }).check(),
    createBid: srv.can({ action: "createBid" }).check(),
    editGeneral: srv.can({ action: "editGeneral" }).check(),
    startWorkflow: srv.can({ action: "startWorkflow" }).check(),
    editContacts: srv.can({ action: "editContacts" }).check(),
    editRequirement: srv.can({ action: "editRequirement" }).check(),
    changePartner: srv.can({ action: "changePartner" }).check(),
    editPartnerData: srv.can({ action: "editPartnerData" }).check(),
    addMapping: srv.can({ action: "addMapping" }).check(),
    editMapping: srv.can({ action: "editMapping" }).check(),
    editUBS: srv.can({ action: "editBiddingSheet" }).check(),
    removeMapping: srv.can({ action: "removeMapping" }).check(),
    generateOffer: srv.can({ action: "generateOffer" }).check()
  };
};
