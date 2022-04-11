import React, { useEffect, useRef, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";

const debug = require("debug")("components:countdown");

const GET_SERVER_TIME = gql`
  query getCurrentTimeForCountDown {
    getCurrentTime
  }
`;

const calculateTimeLeft = difference => {
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

  return timeLeft;
};

const Timer = ({ timeLeft = {} }) => {
  const { t } = useTranslation();
  return (
    <div id="clockdiv">
      {Object.keys(timeLeft).map(interval => (
        <div key={`${interval}`}>
          <span className={interval}>{timeLeft[interval]}</span>
          <div className="smalltext">{t(`components.countdown.${interval}`)}</div>
        </div>
      ))}
    </div>
  );
};

export const CountDownTimer = ({ endTime, serverTime }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({});

  const initialDifference = +new Date(endTime) - +new Date(serverTime);
  const [difference, setDifference] = useState(initialDifference);
  const differenceRef = useRef(initialDifference);

  useEffect(() => {
    differenceRef.current = difference;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setDifference(differenceRef.current - 1000);
      setTimeLeft(calculateTimeLeft(differenceRef.current));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return difference > 0 ? <Timer timeLeft={timeLeft} /> : t("components.countdown.ended");
};

const CountDownTimerLoader = ({ endTime }) => {
  const { data = {}, loading, error } = useQuery(GET_SERVER_TIME, { fetchPolicy: "no-cache" });
  debug("server time resp: %o", { data, loading, error });
  const serverTime = data.getCurrentTime;

  return serverTime && endTime ? <CountDownTimer {...{ serverTime, endTime }} /> : null;
};

export default CountDownTimerLoader;
