/* eslint-disable func-names */
import { expect } from "chai";
import moment from "moment";

import {
  getTimezoneOffset,
  convertTimeZone,
  convertUtcTime
} from "../timeConverter";

const TIMEZEONE_NO_DAYLIGHT_SAVINGS = "Atlantic/Reykjavik";
const TIMEZEONE_NO_DAYLIGHT_SAVINGS2 = "Asia/Hong_Kong";

describe("timeConverter", function() {
  before(() => {
    process.env.TZ = "UTC";
  });
  it("get timezone offset (with DTC)", function() {
    const minutes = getTimezoneOffset(TIMEZEONE_NO_DAYLIGHT_SAVINGS);
    expect(minutes).to.equal(0);
  });

  it("get timezone offset for non-DTC", function() {
    const minutes = getTimezoneOffset(TIMEZEONE_NO_DAYLIGHT_SAVINGS2);
    expect(minutes).to.equal(480);
  });

  it("convert timezone", function() {
    const testDate = new Date(Date.UTC(2021, 11, 1, 0, 0, 0));
    const myOffset = getTimezoneOffset(TIMEZEONE_NO_DAYLIGHT_SAVINGS, testDate);
    const locationOffset = getTimezoneOffset(
      TIMEZEONE_NO_DAYLIGHT_SAVINGS2,
      testDate
    );
    expect(myOffset).to.be.a("number");
    expect(locationOffset).to.be.a("number");
    const convertedDate = convertUtcTime(
      testDate, // Wed Dec 01 2021 00:00:00 UTC
      myOffset
    );
    expect(convertedDate).to.equal("12/01/2021 00:00");

    const convertedDate2 = convertTimeZone(
      testDate, // Wed Dec 01 2021 00:00:00 UTC
      myOffset,
      locationOffset
    );
    const changedDate = moment(convertedDate2).format("YYYY-MM-DD HH:mm");
    expect(changedDate).to.equal("2021-12-01 08:00");
  });
});
