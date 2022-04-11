import EventEmitter from "eventemitter3";

export const Emitter = new EventEmitter();

export const Events = {
  TOP_BAR_SEARCH: "top.bar.search",
  TABLE_BAR_SEARCH: "table.bar.search",
  TOGGLE_SIDE_PANEL: "toggle.sidePanel",
  CALCULATE_TENDER_BID: "click.calculateTenderBid"
};
