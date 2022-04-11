import React from "react";
import { PercentTag } from "/imports/client/components/tags";

export default ({ value }: { value?: number }) => {
  const pctValue = value * 100;
  return <PercentTag value={pctValue} />;
};
