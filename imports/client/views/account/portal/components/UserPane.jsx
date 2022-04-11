import React from "react";
import { Segment, Button } from "semantic-ui-react";

const UserPane = ({ contact, onClickSave }) => {
  if (!contact) return null;
  const name = contact.firstName ? `${contact.firstName} ${contact.lastName}` : contact.mail;
  return (
    <Segment padded>
      {`You are editing as user ${name}`} <br />
      <Button primary content="Save" onClick={onClickSave} />
    </Segment>
  );
};

export default UserPane;
