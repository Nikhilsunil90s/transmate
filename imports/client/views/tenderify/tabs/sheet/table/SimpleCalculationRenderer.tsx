import React from "react";
import { Icon, Popup } from "semantic-ui-react";
import { NumberTag } from "/imports/client/components/tags";

const SimpleCalculationRenderer = ({ value }) => {
  if (typeof value === "number") return <NumberTag value={value} digits={2} />;
  const { value: cellValue, formula } = value || {};
  if (value)
    return (
      <div>
        <NumberTag value={cellValue} digits={2} />
        <span style={{ float: "right" }}>
          {formula && (
            <Popup
              trigger={<Icon name="calculator" color="grey" />}
              content={formula}
            />
          )}
        </span>
      </div>
    );
  return null;
};

export default SimpleCalculationRenderer;
