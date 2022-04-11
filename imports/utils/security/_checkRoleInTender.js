import get from "lodash.get";

export const getRoleForTender = (
  { tender = {} },
  { accountId, userId, isAdmin }
) => {
  const bidders = (tender.bidders || []).map(el => el.accountId);
  const contacts = tender.contacts || []; // {userId, role}
  const contact = contacts.find(el => el.userId === userId);
  const bidUserIds = [];
  (get(tender, ["bidders"]) || []).forEach(bidder => {
    return Array.prototype.push.apply(bidUserIds, bidder.userIds || []);
  });
  let userRole;
  if (contact) {
    userRole = contact.role;
  } else if (bidUserIds.includes(userId)) {
    userRole = "bidder";
  } else if (tender.accountId === accountId && isAdmin) {
    userRole = "owner";
  } else {
    userRole = "locked";
  }
  return {
    isOwner: tender.accountId === accountId,
    isCustomer: tender.customerId === accountId,
    isBidder: bidders.includes(accountId),
    isBidUser: bidUserIds.includes(userId),
    userRole
  };
};
