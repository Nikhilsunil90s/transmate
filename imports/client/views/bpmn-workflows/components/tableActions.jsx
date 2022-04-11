import React from "react";
import { Icon } from "semantic-ui-react";

const WorkflowTableActions = ({ onDelete, workflowId }) => {
  return (
    <div>
      <Icon className="start" name="play" />
      <Icon className="stop" name="pause" />
      <Icon className="undo" name="undo" />
      <Icon name="trash alternate" onClick={() => onDelete(workflowId)} />
    </div>
  );
};

export default WorkflowTableActions;
