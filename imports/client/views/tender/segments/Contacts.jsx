import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";
import { Card, Image } from "semantic-ui-react";

import { IconSegment, SegmentFooter } from "/imports/client/components/utilities/IconSegment";
import ContactModal from "./modals/Contact";
import { GET_CONTACT_INFO } from "../utils/queries";

//#region components
const ContactCard = ({ setModalstate, contact = {}, index, canEdit }) => {
  const { data = {}, error } = useQuery(GET_CONTACT_INFO, {
    variables: { userId: contact.userId }
  });
  if (error) {
    console.error(`>>>>>>> error`, error);
  }

  const contactInfo = data.user || {};
  return (
    <Card raised>
      <Card.Content>
        <Card.Header
          as="a"
          content={contactInfo.name}
          onClick={() => canEdit && setModalstate({ show: true, contact, index })}
        />
        <Card.Meta content={contactInfo.email} />
        <Card.Content extra>
          {contactInfo.avatar && <Image src={contactInfo.avatar} avatar />}
        </Card.Content>
        <Trans i18nKey={`tender.contact.roles.${contact.role}`} />
      </Card.Content>
    </Card>
  );
};
//#endregion

const TenderContacts = ({ tender = {}, security = {}, onSave }) => {
  const { t } = useTranslation();
  const [modalState, setModalstate] = useState({ show: false });
  const showModal = show => setModalstate({ ...modalState, show });

  const contacts = tender.contacts || [];
  const { canEditContacts } = security;

  const updateContact = (data, index) => {
    const mod = contacts;
    if (index != null) {
      mod[index] = data;
    } else {
      mod.push(data);
    }

    onSave({ contacts: mod }, () => showModal(false));
  };
  const deleteContact = index => {
    const mod = contacts;
    mod.splice(index, 1);

    // TODO [#296]: check if we need to strip values:
    return onSave({ contacts: mod }, () => showModal(false));
  };

  return (
    <IconSegment
      name="contacts"
      icon="users"
      title={<Trans i18nKey="tender.contact.title" />}
      body={
        <>
          <Card.Group itemsPerRow={3}>
            {contacts.map((contact, index) => (
              <ContactCard
                key={index}
                {...{ contact, index, setModalstate, canEdit: canEditContacts }}
              />
            ))}
          </Card.Group>

          <ContactModal
            {...modalState}
            isLocked={!canEditContacts}
            onSave={updateContact}
            onDelete={deleteContact}
            showModal={showModal}
          />
        </>
      }
      footerElement={
        canEditContacts && (
          <SegmentFooter
            {...{
              btnText: t("tender.contact.add"),
              onClick: () => setModalstate({ show: true })
            }}
          />
        )
      }
    />
  );
};
export default TenderContacts;
