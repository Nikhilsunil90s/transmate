/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import { Button } from "semantic-ui-react";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import TemplateModal, { TemplateSelectionForm } from "./TemplateModal.jsx";

export default {
  title: "PriceList/components"
};

export const templateForm = () => {
  return (
    <PageHolder name="priceList">
      <TemplateSelectionForm />
    </PageHolder>
  );
};

export const templateModal = () => {
  const [show, showModal] = useState(false);
  const onSave = data => console.log(data);
  return (
    <PageHolder name="priceList">
      <Button content="open modal" onClick={() => showModal(true)} />
      <TemplateModal {...{ show, showModal, onSave }} />
    </PageHolder>
  );
};
