import React from "react";
import pick from "lodash.pick";
import { AutoForm, ErrorsField } from "uniforms-semantic";
import { Tab } from "semantic-ui-react";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { PortalSchema } from "../utils/schema";
import { initSlateValue } from "/imports/client/components/forms/uniforms/RichText.utils";

import GeneralTab from "./TabGeneral";
import ContactsTab from "./TabContacts";
import ServicesTab from "./TabServices";
import CompanyTab from "./TabCompany";
import LanesTab from "./TabLanes";
import NotesTab from "./TabNotes";

const debug = require("debug")("portal:profile");

const schema = new SimpleSchema2Bridge(PortalSchema);

let formRef;
const ProfileForm = ({ ...props }) => {
  const { profile, canEdit, onSave, getRef } = props;
  const panes = [
    {
      menuItem: "General",
      render: () => (
        <Tab.Pane>
          <GeneralTab {...props} />
        </Tab.Pane>
      )
    },
    {
      menuItem: "Contacts",
      render: () => (
        <Tab.Pane>
          <ContactsTab {...props} />
        </Tab.Pane>
      )
    },
    {
      menuItem: "Locations",
      render: () => (
        <Tab.Pane>
          <LanesTab {...props} formRef={formRef} />
        </Tab.Pane>
      )
    },
    {
      menuItem: "Services",
      render: () => (
        <Tab.Pane>
          <ServicesTab {...props} />
        </Tab.Pane>
      )
    },
    {
      menuItem: "Company",
      render: () => (
        <Tab.Pane>
          <CompanyTab {...props} />
        </Tab.Pane>
      )
    },
    {
      menuItem: "Notes",
      render: () => (
        <Tab.Pane>
          <NotesTab {...props} />
        </Tab.Pane>
      )
    }
  ];

  function onSaveForm(update) {
    debug("update %o", update);

    // only saving the changed keys:
    const changedKeys = Object.keys(formRef.state.changedMap);
    onSave(pick(update, changedKeys));
  }
  return (
    <AutoForm
      schema={schema}
      model={{
        ...profile,
        service: profile.service || {},
        fleet: profile.fleet || [],
        industries: profile.industries || [],
        certificates: profile.certificates || [],
        notes: profile.notes ? initSlateValue(profile.notes) : undefined
      }}
      onSubmit={onSaveForm}
      disabled={!canEdit}
      ref={ref => {
        formRef = ref;

        // eslint-disable-next-line no-unused-expressions
        getRef && getRef(ref);
      }}
      modelTransform={(mode, model) => {
        if (["submit", "validate"].includes(mode)) {
          return {
            ...model,
            notes: JSON.stringify(model.notes)
          };
        }
        return model;
      }}
      autosave
      autosaveDelay={2000}
    >
      <Tab menu={{ secondary: true, pointing: true, stackable: true }} panes={panes} />
      <ErrorsField />
    </AutoForm>
  );
};

export default ProfileForm;
