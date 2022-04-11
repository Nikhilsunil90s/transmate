import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "semantic-ui-react";

import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import PackingForm from "./PackingForm";

const PackingModal = ({
  btnText,
  existingItems = [],
  newItems = [],
  totalWeight,
  formRef,
  onClick,
  onSubmit,
  onConfirm,
  onCancel
}) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const openModal = () => {
    setOpen(true);

    if (onClick) onClick();
  };
  const onSave = () => onConfirm();

  const onSubmitForm = formData => onSubmit(formData, () => setOpen(false));

  return (
    <>
      <Button size="big" onClick={openModal} primary content={btnText} />

      <ModalComponent
        size="large"
        show={open}
        showModal={setOpen}
        body={
          <PackingForm
            existingItems={existingItems}
            newItems={newItems}
            totalWeight={totalWeight}
            onSubmit={onSubmitForm}
            ref={formRef}
          />
        }
        actions={
          <ModalActions
            {...{
              showModal: setOpen,
              saveLabel: t("conversations.modal.submit"),
              onSave,
              onCancel
            }}
          />
        }
      />
    </>
  );
};

export default PackingModal;
