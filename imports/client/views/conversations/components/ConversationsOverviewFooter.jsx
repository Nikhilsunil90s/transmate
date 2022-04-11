/* eslint-disable no-use-before-define */
import React, { useContext } from "react";
import { Button, Icon } from "semantic-ui-react";
import { Trans } from "react-i18next";

import { CheckConversationSecurity } from "/imports/utils/security/checkUserPermissionsForConversations";
import LoginContext from "/imports/client/context/loginContext";

const debug = require("debug")("tender:overview");

const ConversationOverviewFooter = () => {
  return <CreateConversationButton />;
};

const CreateConversationButton = () => {
  const context = useContext(LoginContext);
  const canCreateConversation = new CheckConversationSecurity({}, context)
    .can({ action: "startConversation" })
    .check();

  debug("can create tender: %s", canCreateConversation);

  return (
    <>
      {canCreateConversation && (
        <Button primary id="createConversation">
          <Icon name="circle add" />
          <Trans i18nKey="conversation.add" />
        </Button>
      )}
    </>
  );
};

export default ConversationOverviewFooter;
