import { useMutation } from "@apollo/client";
import React, { useContext, useState } from "react";
import { Trans } from "react-i18next";
import { Button, Segment } from "semantic-ui-react";

import ConversationsOverview from "/imports/client/views/conversations/components/ConversationsOverview";
import ConversationModal from "/imports/client/components/conversations/components/ConversationModal";
import { CREATE_CONVERSATION } from "/imports/client/views/tender/utils/queries";
import { getRoleForTender } from "/imports/utils/security/_checkRoleInTender";
import { toast } from "react-toastify";
import LoginContext from "/imports/client/context/loginContext";

function initReferences(
  tender: any,
  {
    accountId,
    userId,
    isAdmin
  }: { accountId: string; userId: string; isAdmin: boolean }
) {
  const { isOwner, isBidder, userRole } = getRoleForTender(tender, {
    accountId,
    userId,
    isAdmin
  });
  if (userRole === "locked") return {};
  if (isOwner) {
    return {
      participants: (tender.bidders || []).reduce(
        (acc: Array<string>, { userIds }) => {
          return [...acc, ...userIds];
        },
        []
      )
    };
  }

  if (isBidder) {
    return {
      participants: (tender.contacts || []).filter(({ role }) =>
        ["owner", "manager"].includes(role)
      )
    };
  }
  return {};
}

// locked -> cannot send to anybody
// owner	-> start conversation with any bidder
// bidder -> start conversation with buyer
const TenderConversations = ({ tenderId, tender }) => {
  const context = useContext(LoginContext);
  const [show, showModal] = useState<boolean>(false);
  const [createConversation] = useMutation(CREATE_CONVERSATION);
  const selector = {
    documentType: "tender",
    documentId: tenderId
  };

  const reference = initReferences(tender, context);

  const onSaveConversation = ({
    participants = [],
    subject,
    message,

    broadcast
  }) => {
    createConversation({
      variables: {
        input: {
          documentType: "tender",
          documentId: tenderId,
          participants,
          subject,
          message,

          broadcast
        }
      }
    })
      .then(() => {
        toast.success("Conversation created");
        showModal(false);
      })
      .catch(error => {
        toast.error(error.message);
      });
  };

  return (
    <>
      <Segment padded="very">
        <ConversationsOverview selector={selector} />
      </Segment>
      <Button primary content={<Trans i18nKey="tender.conversation.new" />} />
      <ConversationModal
        show={show}
        showModal={showModal}
        reference={reference}
        onSave={onSaveConversation}
      />
    </>
  );
};

export default TenderConversations;
