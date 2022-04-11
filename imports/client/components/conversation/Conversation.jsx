import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useApolloClient } from "@apollo/client";

import { Segment, Comment, Header } from "semantic-ui-react";
import { toast } from "react-toastify";

import Loader from "/imports/client/components/utilities/Loader.jsx";
import MomentTag from "/imports/client/components/tags/MomentTag";
import { useParams } from "react-router-dom";
import CommentBox from "./components/CommentBox";
import ConversationComment from "./components/Comment";

import { GET_CONVERSATION, REMOVE_COMMENT, UPDATE_COMMENT, ADD_COMMENT } from "./utils/queries";

const debug = require("debug")("conversations");

const Conversation = () => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const { _id: conversationId } = useParams();

  const { data = {}, loading, error, refetch } = useQuery(GET_CONVERSATION, {
    variables: { conversationId }
  });
  debug("apollo data", { data, loading, error });
  if (error) console.error({ error });
  const conversation = data.conversation || {};

  async function removeComment(commentId) {
    debug("removing %s", commentId);
    try {
      const { errors } = await client.mutate({
        mutation: REMOVE_COMMENT,
        variables: { commentId }
      });
      if (errors) throw errors;
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Could not remove comment");
    }
  }

  async function saveComment(commentId, update, cb) {
    debug("updating %s %o", commentId, update);
    try {
      const { errors } = await client.mutate({
        mutation: UPDATE_COMMENT,
        variables: { input: { commentId, value: update } }
      });
      if (errors) throw errors;
      if (typeof cb === "function") cb();
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Could not save comment");
    }
  }

  async function addComment(value, cb) {
    debug("adding comment %o", value);
    try {
      const { errors } = await client.mutate({
        mutation: ADD_COMMENT,
        variables: { input: { conversationId, value } }
      });
      if (errors) throw errors;
      if (typeof cb === "function") cb();
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Could not save comment");
    }
  }

  if (loading) return <Loader loading />;

  return (
    <Segment padded="very">
      <Comment.Group>
        <Header as="h2">
          {conversation.subject}
          <Header.Subheader>
            {conversation.user?.name}
            {" | "}
            <MomentTag date={conversation.created?.at} />
          </Header.Subheader>
        </Header>

        {conversation.comments
          ? conversation.comments.map(({ id, ...comment }, i) => (
              <ConversationComment
                key={i}
                {...{ commentId: id, comment }}
                {...{ removeComment, saveComment }}
              />
            ))
          : t("conversation.comments.empty")}

        {!conversation.broadcast && (
          <CommentBox label={t("conversation.comments.add")} onSave={addComment} />
        )}
      </Comment.Group>
    </Segment>
  );
};

export default Conversation;
