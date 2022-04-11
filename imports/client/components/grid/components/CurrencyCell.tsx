import React from "react";
import { CurrencyTag } from "/imports/client/components/tags";

export default ({
  value = {}
}: {
  value: { value?: number; unit?: string };
}) => {
  const { value: number, unit } = value;
  return <CurrencyTag value={number} currency={unit} />;
};
