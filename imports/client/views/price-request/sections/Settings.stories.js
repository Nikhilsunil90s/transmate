import React from "react";

import PageHolder from "../../../components/utilities/PageHolder";
import { PriceRequestSettings } from "./Settings.jsx";
import businessDays from "../../../../api/_jsonSchemas/simple-schemas/_utilities/businessDays";

import { dummyProps } from "../utils/storydata";

export default {
  title: "PriceRequest/Segments/settings"
};

const specificProps = {
  canViewSettings: false,

  // these are the mapped values, not the results of the call:
  priceListTemplates: [
    {
      key: "TEMPL:SPOT-SHIPM-SINGLE",
      text: "TEMPL:SPOT-SHIPM-SINGLE",
      value: "TEMPL:SPOT-SHIPM-SINGLE"
    },
    { key: "TEST-34", text: "Test 345", value: "TEST-34" }
  ]
};

export const basic = () => {
  const props = {
    ...dummyProps,
    ...specificProps
  };

  props.priceRequest.dueDate = businessDays();

  return (
    <PageHolder main="PriceRequest">
      <PriceRequestSettings {...props} />
    </PageHolder>
  );
};

export const disabled = () => {
  const props = {
    ...dummyProps,
    ...specificProps
  };

  props.security.canEditSettings = false;
  return (
    <PageHolder main="PriceRequest">
      <PriceRequestSettings {...props} />
    </PageHolder>
  );
};

export const canNotViewSettings = () => {
  const props = {
    ...dummyProps,
    ...specificProps
  };

  props.canViewSettings = false;
  return (
    <PageHolder main="PriceRequest">
      <PriceRequestSettings {...props} />
    </PageHolder>
  );
};
