import React from "react";
import moment from "moment";
import { Message } from "semantic-ui-react";

const NotificationPane = ({ notifications }) => {
  if (!notifications) return null;
  const { error, lastSave } = notifications;
  return (
    <>
      {error && <Message error content="Could not save changed!" />}
      {lastSave && <Message info content={`Last saved: ${moment(lastSave).fromNow()}`} />}
    </>
  );
};

export default NotificationPane;
