/* eslint-disable react-hooks/rules-of-hooks */
import { useTranslation } from "react-i18next";
import React, { useState, ReactNode } from "react";
import { Confirm } from "semantic-ui-react";

const rootEl = document.getElementById("react-root");

interface Props {
  show: boolean;
  open?: boolean; // phase out this one!
  loading?: boolean;
  showConfirm: (show: boolean) => void;
  content?: ReactNode;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export const ConfirmComponent = ({
  open,
  show,
  showConfirm,
  content,
  onCancel,
  loading,
  onConfirm = () => {},
  ...props
}: Props) => {
  const { t } = useTranslation();
  return (
    <Confirm
      data-test="confirmModal"
      mountNode={rootEl}
      {...props}
      dimmer
      open={open || show}
      content={content ? { content } : t("form.confirm.sure")}
      onCancel={
        onCancel ||
        (() => {
          showConfirm(false);
        })
      }
      onConfirm={onConfirm}
      confirmButton={{
        loading,
        content: t("form.confirm.ok"),
        "data-test": "confirmButton"
      }}
      cancelButton={{
        content: t("form.confirm.cancel"),
        "data-test": "cancelButton"
      }}
    />
  );
};

const initializeConfirm = () => {
  const [show, showConfirm] = useState(false);

  return {
    showConfirm,
    Confirm: ({ content, onCancel, onConfirm, ...props }) => (
      <ConfirmComponent
        {...{ ...props, show, showConfirm, content, onCancel, onConfirm }}
      />
    )
  };
};

export default initializeConfirm;
