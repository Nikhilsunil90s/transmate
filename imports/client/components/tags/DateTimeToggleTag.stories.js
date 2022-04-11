import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import DateTimeTZtoggleTag from "./DateTimeToggleTag";

export default {
  title: "Components/Tags"
};

export const timeZoneToggle = () => {
  const date = 1635444000000; // Thu Oct 28 2021 20:00:00 GMT+0200 (Central European Summer Time)
  return (
    <PageHolder main="PriceRequest">
      <DateTimeTZtoggleTag date={date} locationTZ="America/Chicago" />
    </PageHolder>
  );
};
