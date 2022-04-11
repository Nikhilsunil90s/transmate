import React from "react";
import { useTranslation } from "react-i18next";
import { Message } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import {
  ContactOverview,
  ContactFooter
} from "/imports/client/views/account/profile/sections/Contacts";

// Contact annotation if the account is not linked
// contacts are stored in the annotation object of the address itself opposed the linked version,
// where the contacts are stored in the account itself...

const debug = require("debug")("address:annotation");

const AddressContactNotesSegment = ({ onSave, annotation, canEdit }) => {
  const { t } = useTranslation();
  const contacts = (annotation?.contacts || []).map(
    ({ userId, events, linkedId, __typename, ...contact }) => contact
  );
  const { partnerId } = annotation;

  const saveContacts = ({ contacts: updatedContacts }, cb) => {
    debug("updating %o", { contacts: updatedContacts });
    onSave({ contacts: updatedContacts }, cb);
  };

  const segmentData = {
    name: "contacts",
    icon: "address book",
    title: t("account.profile.contacts.title"),
    body: (
      <>
        <Message info content={t("account.profile.contacts.info")} />
        <ContactOverview {...{ contacts, saveContacts, canEdit, disableInvite: true, partnerId }} />
      </>
    ),
    ...(canEdit
      ? {
          footer: (
            <div>
              <ContactFooter {...{ saveContacts, contacts }} />
              {/* <Button basic primary content="unlink" onClick={()=> {}}/> */}
            </div>
          )
        }
      : undefined)
  };
  return <IconSegment {...segmentData} />;
};

export default AddressContactNotesSegment;
