import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, Button } from "semantic-ui-react";

const CommentBox = ({ label, onSave }) => {
  const { t } = useTranslation();
  const [comment, setValue] = useState("");
  return (
    <Form reply>
      <Form.TextArea
        value={comment}
        onChange={(_, { value }) => setValue(value)}
        placeholder={t("conversation.comments.placeholder")}
      />
      <Button
        content={label}
        disabled={!comment}
        labelPosition="left"
        icon="edit"
        primary
        onClick={() => onSave(comment, () => setValue(""))}
      />
    </Form>
  );
};

export default CommentBox;
