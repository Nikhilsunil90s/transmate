import { tabs } from "/imports/api/_jsonSchemas/enums/tenderify.js";

const debug = require("debug")("tenderBid");

export const initializeTabs = ({ tenderBid, security }) => {
  debug("intialize tabs %o", { tenderBid, security });
  return tabs;
};
