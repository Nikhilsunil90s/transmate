import React from "react";
import { Icon, Popup } from "semantic-ui-react";
import { CurrencyTag } from "/imports/client/components/tags";

const CalculationInputRenderer = ({ value }) => {
  const { amount } = value || {};
  if (amount)
    return (
      <div>
        <CurrencyTag value={amount.value} currency={amount.unit} />
        <Popup
          trigger={
            <Icon name="info circle" color="green" style={{ float: "right" }} />
          }
          disabled={!value.tooltip}
          content={value.tooltip}
        />
      </div>
    );
  return null;
};

export default CalculationInputRenderer;
