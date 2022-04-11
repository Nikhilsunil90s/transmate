import React from "react";
import SimpleSchema from "simpl-schema";
import { AutoForm, SubmitField } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import { SafetySelectField } from "../modals/Safety";
import AddressProfileTab from "./Profile";
import { ContactSegment, LinkSegment } from "../components";

export default {
  title: "Address/Tabs/profile"
};

const dummyProps = {
  security: { canEdit: true },
  address: {
    annotation: {
      safety: {
        pbm: ["mouth"],
        instructions:
          '[{"children":[{"text":"test "},{"text":"bold test","bold":true}]}]'
      },
      hours:
        '[{"children":[{"text":"test "},{"text":"bold test","bold":true}]}]'
    }
  },
  onSave(update, cb) {
    console.log(update);
    if (typeof cb === "function") cb();
  }
};

export const ProfileTab = () => {
  const props = { ...dummyProps };
  return (
    <PageHolder main="Address">
      <AddressProfileTab {...props} />
    </PageHolder>
  );
};

// as part of a uniforms:
export const safetySelectField = () => {
  const model = { pbm: ["mouth"] };
  return (
    <PageHolder main="Address">
      <AutoForm
        schema={
          new SimpleSchema2Bridge(
            new SimpleSchema({
              pbm: { type: Array },
              "pbm.$": { type: String }
            })
          )
        }
        model={model}
        onSubmit={data => console.log(data)}
      >
        <SafetySelectField name="pbm" />
        <SubmitField />
      </AutoForm>
    </PageHolder>
  );
};

export const contactSectionUnlinked = () => {
  const { address, security = {}, onSave } = { ...dummyProps };
  const { canEdit } = security;

  const segmentProps = { annotation: address.annotation, canEdit, onSave };
  return (
    <PageHolder main="Address">
      {address?.annotation?.partnerId ? (
        <ContactSegment {...segmentProps} />
      ) : (
        <LinkSegment {...segmentProps} />
      )}
    </PageHolder>
  );
};

export const contactSectionLinked = () => {
  const { address, security = {}, onSave } = { ...dummyProps };
  const { canEdit } = security;

  const segmentProps = {
    annotation: { ...address.annotation, partnerId: "dummyId" },
    canEdit,
    onSave
  };
  return (
    <PageHolder main="Address">
      {segmentProps.annotation?.partnerId ? (
        <ContactSegment {...segmentProps} />
      ) : (
        <LinkSegment {...segmentProps} />
      )}
    </PageHolder>
  );
};
