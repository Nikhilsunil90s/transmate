import React from "react";
import { tabProptypes } from "../../utils/propTypes";
import Conversions from "./sections/Conversions";
import CurrencyExchange from "./sections/Currency";
import Fuel from "./sections/Fuel";

const Settings = props => {
  return (
    <>
      <Conversions {...props} />
      <CurrencyExchange {...props} />
      <Fuel {...props} />
    </>
  );
};

Settings.propTypes = {
  ...tabProptypes
};

export default Settings;
