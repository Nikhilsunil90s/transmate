import React from "react";
import { Icon } from "semantic-ui-react";

const ValidRenderer = ({ value }) => {
  return (
    <span>
      {value ? (
        <Icon name="check circle" color="blue" />
      ) : (
        <Icon name="exclamation triangle" color="yellow" />
      )}
    </span>
  );
};

export default ValidRenderer;
