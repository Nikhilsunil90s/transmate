import React from "react";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import PartnerModal, { PartnerForm } from "./NewPartnerModal";

export default {
  title: "Partners/newPartner"
};

export const form = () => {
  return (
    <PageHolder main="Partner">
      <PartnerForm
        onSave={data => {
          console.log(data);
        }}
      />
    </PageHolder>
  );
};

export const modal = () => {
  const props = {
    show: true,
    showModal: () => {}
  };
  return <PartnerModal {...props} />;
};
