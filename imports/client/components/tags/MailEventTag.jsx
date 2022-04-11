import React from "react";
import moment from "moment";
import { Popup, Icon } from "semantic-ui-react";

const MailEventTag = ({ action = {} }) => {
  let icon;
  let color = "green";
  switch (action.event) {
    case "open":
      icon = "envelope open outline";
      break;
    case "delivery":
    case "delivered":
      icon = "check";
      break;
    case "processed":
      icon = "at";
      break;
    case "click":
      icon = "hand point up";
      break;
    case "dropped":
      icon = "minus";
      color = "orange";
      break;
    case "bounce":
    case "spamcomplaint":
    case "hardbounce":
      icon = "attention";
      color = "red";
      break;
    case "send":
      icon = "send";
      break;
    default:
      icon = "info";
      color = "grey";
  }

  return (
    <Popup
      content={`${action.event}, ${moment(action.timestamp).fromNow()}`}
      trigger={<Icon name={icon} color={color} />}
    />
  );
};

export default MailEventTag;
