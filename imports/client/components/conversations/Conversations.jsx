import React, { useState } from "react";
import { useApolloClient } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { Segment, Button } from "semantic-ui-react";
import { toast } from "react-toastify";

import ConversationsOverview from "/imports/client/views/conversations/components/ConversationsOverview";
import ConversationModal from "./components/ConversationModal";

import { NEW_CONVERSATION } from "./utils/queries";
import useRoute from "../../router/useRoute";

const Conversations = () => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const [show, showModal] = useState(false);

  const { goRoute, params, name: route } = useRoute();
  const { _id: documentId } = params;

  const selector = {};

  if (route === "tender") {
    selector.documentType = "tender";
    selector.documentId = documentId;
  }

  async function onSaveModal(update) {
    try {
      const { data = {}, errors } = await client.mutate({
        mutation: NEW_CONVERSATION,
        variables: { input: update }
      });

      const conversationId = data.createConversation?.id;
      if (errors) throw errors;
      if (!conversationId) throw new Error("No id returned");
      goRoute("conversation", { _id: conversationId });
    } catch (error) {
      console.error({ error });
      toast.error("Could not create new conversation");
    }
  }
  return (
    <Segment padded="very">
      <ConversationsOverview selector={selector} />
      <Button primary content={t("form.new")} onClick={() => showModal(true)} />
      <ConversationModal {...{ show, showModal }} onSave={onSaveModal} />
    </Segment>
  );
};

export default Conversations;
