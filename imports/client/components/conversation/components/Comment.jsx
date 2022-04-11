import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Comment, TextArea } from "semantic-ui-react";
import MomentTag from "/imports/client/components/tags/MomentTag";
import LoginContext from "/imports/client/context/loginContext";

const ConversationComment = ({ commentId, comment, removeComment, saveComment }) => {
  const { t } = useTranslation();
  const [isEditing, setEditing] = useState(false);
  const [editingValue, setEditingValue] = useState(comment.value);
  const { userId } = useContext(LoginContext);
  const canPerformActions = comment?.created?.by === userId;

  function onSave() {
    saveComment(commentId, editingValue, () => setEditing(false));
  }
  return (
    <Comment>
      <Comment.Avatar src={comment.user.avatar} />
      <Comment.Content>
        <Comment.Author as="a">{comment.user.name}</Comment.Author>
        <Comment.Metadata>
          <span className="date">
            <MomentTag date={comment.createdAt} />
          </span>
        </Comment.Metadata>
        <Comment.Text>
          {isEditing ? (
            <TextArea value={editingValue} onChange={(_, { value }) => setEditingValue(value)} />
          ) : (
            comment.value
          )}
        </Comment.Text>
        {canPerformActions && (
          <Comment.Actions>
            {isEditing ? (
              <>
                <Comment.Action onClick={() => setEditing(false)} content={t("form.cancel")} />
                <Comment.Action onClick={onSave} content={t("form.save")} />
              </>
            ) : (
              <Comment.Action onClick={() => setEditing(true)} content={t("form.edit")} />
            )}
            <Comment.Action onClick={() => removeComment(commentId)} content="Remove" />
          </Comment.Actions>
        )}

        {comment.children &&
          comment.children.map((childComment, i) => (
            <ConversationComment key={i} coment={childComment} />
          ))}
      </Comment.Content>
    </Comment>
  );
};

export default ConversationComment;
