/* eslint-disable func-names */
import { expect } from "chai";
import { getIsoDateTimeGmt } from "../DHL-node";

const debug = require("debug")("shipmentpicking:dhl:test");

describe("check dhl functions", function() {
  it("iso date", function() {
    const dateString = "2021-06-20T20:26:31.135Z";
    const dateStringIso = "2021-06-20T20:26:31GMT+00:00";
    const date = new Date(dateString);

    const isoDate = getIsoDateTimeGmt(date);

    debug({ dateString, date, isoDate, dateStringIso });
    expect(isoDate).to.be.an("string");
    expect(isoDate).to.eql(dateStringIso);
  });
});
