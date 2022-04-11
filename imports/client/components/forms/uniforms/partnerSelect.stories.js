import React from "react";
import SimpleSchema from "simpl-schema";
import { AutoForm, SubmitField } from "uniforms-semantic";
import { connectField } from "uniforms";

import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import PageHolder from "../../utilities/PageHolder";
import { PartnerSelectField } from "./PartnerSelect.jsx";

export default {
  title: "Components/Forms/partnerSelect"
};

const PartnerSelectFieldConnected = connectField(PartnerSelectField);

const dummyProps = {
  onSubmitForm: console.log,
  partnerOptions: [
    {
      key: "C50957",
      label:
        "ALL FRESH LOGISTICS GMBH <span style='opacity: .3'>— C50957</span>",
      name: "ALL FRESH LOGISTICS GMBH"
    },
    {
      key: "C18310",
      label:
        "Alfaran Trailer Management and Logistics <span style='opacity: .3'>— C18310</span>",
      name: "Alfaran Trailer Management and Logistics"
    },
    {
      key: "C18311",
      label: "DHL <span style='opacity: .3'>— C18311</span>",
      name: "DHL"
    },
    {
      key: "C71558",
      label: "Arnold Spedition <span style='opacity: .3'>— C71558</span>",
      name: "Arnold Spedition"
    }
  ]
};

// as part of a uniforms:
export const multiple = () => {
  const { onSubmitForm, partnerOptions } = dummyProps;
  const props = { name: "partner", data: partnerOptions, multiple: true };
  const formData = { partner: ["C50957"] };

  return (
    <PageHolder main="AccountPortal">
      <AutoForm
        model={formData}
        schema={
          new SimpleSchema2Bridge(
            new SimpleSchema({
              partner: { type: Array, label: "Partner" },
              "partner.$": { type: String }
            })
          )
        }
        onSubmit={onSubmitForm}
      >
        <PartnerSelectFieldConnected {...props} />
        <br />
        <SubmitField />
      </AutoForm>
    </PageHolder>
  );
};

export const single = () => {
  const { onSubmitForm, partnerOptions } = dummyProps;
  const props = { name: "partner", data: partnerOptions };
  const formData = { partner: "C50957" };

  return (
    <PageHolder main="AccountPortal">
      <AutoForm
        model={formData}
        schema={
          new SimpleSchema2Bridge(
            new SimpleSchema({
              partner: { type: String, label: "Partner" }
            })
          )
        }
        onSubmit={onSubmitForm}
      >
        <PartnerSelectFieldConnected {...props} />
        <br />
        <SubmitField />
      </AutoForm>
    </PageHolder>
  );
};
