import React from "react";
import { Icon } from "semantic-ui-react";

const TaskTableType = ({ type }) => {
  const isApproval = type === "approval";

  return <>{isApproval ? <Icon name="exclamation" /> : <Icon name="hand paper outline" />}</>;
};

export default TaskTableType;
