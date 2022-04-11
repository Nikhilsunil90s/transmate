import React from "react";
import { Icon, Popup } from "semantic-ui-react";
import { CurrencyTag } from "/imports/client/components/tags";
import { ICellRendererParams } from "@ag-grid-community/core";

const FillOutRenderer = ({ value }: ICellRendererParams) => {
  const { amount } = value || {};
  if (amount)
    return (
      <div>
        <CurrencyTag value={parseFloat(amount.value)} currency={amount.unit} />
        <span style={{ float: "right" }}>
          {value.formula && (
            <Popup
              trigger={<Icon name="calculator" color="grey" />}
              content={value.formula}
            />
          )}
          {value.tooltip && (
            <Popup
              trigger={
                <Icon
                  name="info circle"
                  color="green"
                  style={{ float: "right" }}
                />
              }
              content={value.tooltip}
            />
          )}
          {value.errors?.length && (
            <Popup
              trigger={
                <Icon
                  name="warning circle"
                  color="red"
                  style={{ float: "right" }}
                />
              }
              content={value.errors.join(", ")}
            />
          )}
        </span>
      </div>
    );
  return null;
};

export default FillOutRenderer;
