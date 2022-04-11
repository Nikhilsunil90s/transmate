import React from "react";

import PageHolder from "../../../../components/utilities/PageHolder";
import ProfileContactSegment from "./Contacts.jsx";
import { ContactForm } from "../modals/Contact.jsx";

export default {
  title: "Account/Profile/Segments/contacts"
};

const dummyProps = {
  profile: {
    accountId: "S12345",
    contacts: [
      {
        // linked user:
        type: "general",
        firstName: "First",
        lastName: "Last",
        mail: "test@test.com",
        phone: "+32 45678123",
        userId: "Dsqp3CRYjFpF8rQbh",
        signedOn: true,
        avatar: "//assets.transmate.eu/app/placeholder-user.png"
      },
      {
        // linked user:
        type: "general",
        firstName: "First1",
        lastName: "Last2",
        mail: "test@test.com",
        phone: "+32 45678123",
        userId: "Dsqp3CRYjFpF8rQbh",
        signedOn: false,
        avatar: "//assets.transmate.eu/app/placeholder-user.png"
      },
      {
        // unliked user:
        type: "sales",
        firstName: "First",
        lastName: "Last",
        mail: "test2@test.com",
        phone: "+32 45678123",
        avatar: "//assets.transmate.eu/app/placeholder-user.png"
      }
    ]
  },
  onSaveAction: () => {},
  canEdit: true,
  refreshData: () => {}
};

export const basic = () => (
  <PageHolder main="AccountPortal">
    <ProfileContactSegment {...dummyProps} />
  </PageHolder>
);

export const canEdit = () => {
  const props = { ...dummyProps };
  props.accessControl = () => true;
  return (
    <PageHolder main="AccountPortal">
      <ProfileContactSegment {...props} />
    </PageHolder>
  );
};

export const empty = () => {
  dummyProps.profile.contacts = [];
  return (
    <PageHolder main="AccountPortal">
      <ProfileContactSegment {...dummyProps} />
    </PageHolder>
  );
};

export const form = () => {
  const props = {
    data: {},
    onSave: () => {}
  };
  return (
    <PageHolder main="AccountPortal">
      <ContactForm {...props} />
    </PageHolder>
  );
};
