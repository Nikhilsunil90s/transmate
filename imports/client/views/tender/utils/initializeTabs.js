import get from "lodash.get";

const debug = require("debug")("tender:tabs");

const TABS = {
  default: ["introduction"],
  biddingNDA: ["introduction", "NDA"],
  biddingNDAPassed: [
    "introduction",
    "requirements",
    "profile"

    /* "analytics"*/
  ],
  owner: [
    "dashboard",
    "introduction",
    "requirements",
    "partners",
    "scope",
    "data",
    "profile"

    /* "analytics" */
  ],
  viewer: [
    "dashboard",
    "introduction",
    "requirements",
    "scope",
    "data",
    "profile",
    "partners"

    /* "analytics", */
  ]
};

export const initializeTabs = ({ tender, security }) => {
  const myBid = get(tender, ["bidders", 0]);

  const NDArequired = get(tender, ["params", "NDA", "required"]);
  const NDAaccepted = get(myBid, ["NDAresponse", "accepted"]);
  if (
    [
      security.isBidder, // bidder account
      ["open"].includes(tender.status),
      NDArequired && !NDAaccepted
    ].every(x => x)
  ) {
    debug("viewing tabs as bidder - NDA");
    return TABS.biddingNDA;
  }

  if (security.isBidder && ["open"].includes(tender.status)) {
    debug("viewing tabs as bidder - NDA passed");
    return TABS.biddingNDAPassed;
  }

  if (
    [
      security.isOwner,
      ["owner", "manager", "follower", "analyst"].includes(security.userRole),
      ["open", "review", "closed"].includes(tender.status)
    ].every(x => x)
  ) {
    debug("viewing tabs as owner, restricted view");
    return TABS.viewer;
  }

  if (["manager", "owner"].includes(security.userRole)) {
    debug("viewing tabs as owner, full view");
    return TABS.owner;
  }
  debug("viewing tabs as external (intro only)");
  return TABS.default;
};
