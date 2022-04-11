import React, { useEffect, useRef, useState } from "react";
import { oneOfType, string, object, number } from "prop-types";
import { getTimeRemaining } from "../../../../utils/functions/fnGetTimeRemaining";

// eslint-disable-next-line no-unused-vars
const debug = require("debug")("function:fnGetTimeRemaining");

const SECONDS_TO_REFRESH = 1;

const calulateTimeRemaining = timeRemaining => {
  let timeRemainingString;

  // debug("timeRemaining", timeRemaining);
  const isTimeInvalid = !timeRemaining.total;
  const isTimeDue = timeRemaining.total <= 0;

  // use hasOwnProperty as it will be often 0
  const isTimeValid = Object.prototype.hasOwnProperty.call(timeRemaining, "seconds");

  switch (true) {
    case isTimeDue:
      timeRemainingString = "Past Due";
      break;
    case isTimeInvalid:
      timeRemainingString = " - ";
      break;
    case isTimeValid:
      timeRemainingString = `${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s remaining...`;
      break;
    default:
      break;
  }

  return timeRemainingString;
};

const RelativeTimeCounter = props => {
  const { dueDate, serverTimeDifference, status } = props;
  const differenceRef = useRef(serverTimeDifference);

  useEffect(() => {
    differenceRef.current = serverTimeDifference;
  });

  const [timeRemaining, setTimeRemaining] = useState(Date.now());

  useEffect(() => {
    const endTime = dueDate || new Date();
    const timeToRefresh = SECONDS_TO_REFRESH * 1000;

    const interval = setInterval(() => {
      const thisTime = new Date() - differenceRef.current || 0;

      // run at start and wait for x seconds to rerun
      const currenTimeRemaining = getTimeRemaining(thisTime, endTime);
      setTimeRemaining(currenTimeRemaining);

      if (currenTimeRemaining.total <= 0) {
        // time is up
        clearInterval(interval);
      }
    }, timeToRefresh);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!dueDate || status !== "requested") {
    // no due date given
    return <p>{" - "}</p>;
  }

  return <p>{calulateTimeRemaining(timeRemaining)}</p>;
};

RelativeTimeCounter.propTypes = {
  dueDate: oneOfType([string, object, number])
};

export default RelativeTimeCounter;
