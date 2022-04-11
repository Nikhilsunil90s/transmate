import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import EntityModal, { EntityForm } from "./entities/modals/EntityModal";

export default {
  title: "Settings/accountAdmin"
};

export const entityForm = () => {
  const props = {
    onSubmitForm: console.log,
    data: {},
    isLocked: false
  };
  return (
    <PageHolder>
      <EntityForm {...props} />
    </PageHolder>
  );
};

export const entityModal = () => {
  const props = {
    onSubmitForm: console.log,
    data: {},
    isLocked: false,
    show: true,
    showModal: () => {},
    existingCodes: ["test"]
  };
  return (
    <PageHolder>
      <EntityModal {...props} />
    </PageHolder>
  );
};
