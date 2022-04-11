import React from "react";
import { Icon } from "semantic-ui-react";

const TaskTableStatus = ({ finished }) => {
  return <>{finished ? <Icon name="green check" /> : "waiting input"}</>;
};

export default TaskTableStatus;
