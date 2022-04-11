import React from "react";
import moment from "moment";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import { CountDownTimer } from "./CountDown.jsx";

export default {
  title: "Components/countdown"
};

export const counting = () => {
  const props = {
    endTime: moment()
      .add(1, "days")
      .toDate(),
    serverTime: new Date()
  };

  return (
    <PageHolder main="AccountPortal">
      <CountDownTimer {...props} />
    </PageHolder>
  );
};

export const pastDue = () => {
  const props = {
    endTime: moment()
      .subtract(1, "days")
      .toDate(),
    serverStartTime: new Date()
  };

  return (
    <PageHolder main="AccountPortal">
      <CountDownTimer {...props} />
    </PageHolder>
  );
};
