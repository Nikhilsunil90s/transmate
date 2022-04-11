import React, { useState } from "react";
import { getTimezoneOffset } from "/imports/utils/functions/timeConverter";
import { Icon, Popup } from "semantic-ui-react";

const debug = require("debug")("timeZoneTag");

const DEFAULT_DATE_OPTIONS = {
  month: "2-digit",
  day: "2-digit"
};

const DEFAULT_TIME_OPTIONS = {
  hour: "2-digit",
  minute: "2-digit"
};

export const DEFAULT_OPTIONS = {
  ...DEFAULT_DATE_OPTIONS,
  ...DEFAULT_TIME_OPTIONS
};

// eslint-disable-next-line new-cap
const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
const DateTimeTZtoggleTag = ({ date = new Date(), options = DEFAULT_OPTIONS, locationTZ }) => {
  const hourDiffs = {
    userTZ: getTimezoneOffset(userTZ) / 60,
    locationTZ: locationTZ ? getTimezoneOffset(locationTZ) / 60 : getTimezoneOffset(userTZ) / 60
  };
  const hourDiffBetweenLocalAndUser = hourDiffs.locationTZ - hourDiffs.userTZ;
  const canToggleTZ = !!locationTZ && hourDiffBetweenLocalAndUser !== 0;

  const [timeZoneKey, setTimeZoneKey] = useState("userTZ"); // default to userTZ
  const diffHours = hourDiffs[timeZoneKey]; // hour difference from UTC
  const hoursToAdd = timeZoneKey === "userTZ" ? 0 : hourDiffBetweenLocalAndUser; // for entry || display

  debug("orgDate:%s, hoursToAdd: %s, tz: %s", new Date(date), hoursToAdd, timeZoneKey);
  const d = new Date(date);
  d.setHours(d.getHours() + hoursToAdd);

  const toggleTimeZone = () => {
    if (!canToggleTZ) return null;
    if (timeZoneKey === "userTZ") return setTimeZoneKey("locationTZ");
    return setTimeZoneKey("userTZ");
  };

  const formattedDate = new Intl.DateTimeFormat("default", options).format(d);
  return (
    <div
      style={{
        display: "flex",
        overflow: "visible",
        whiteSpace: "nowrap"
      }}
    >
      {formattedDate}
      {canToggleTZ && (
        <Popup
          style={{ fontSize: "12px" }}
          disabled={!canToggleTZ}
          content="click to switch between your and location time zone"
          trigger={
            <div
              className="toggleButton"
              as="button"
              onClick={toggleTimeZone}
              style={{
                marginLeft: "4px",
                overflow: "visible",
                whiteSpace: "nowrap",
                cursor: "pointer"
              }}
            >
              <Icon name={timeZoneKey === "locationTZ" ? "globe" : "home"} color="blue" />
              {"UTC"}
              {diffHours > 0 ? "+" : "-"}
              {Math.abs(diffHours)}
            </div>
          }
        />
      )}
    </div>
  );
};

export default DateTimeTZtoggleTag;
