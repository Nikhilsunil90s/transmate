import { useQuery } from "@apollo/client";
import React, { useState } from "react";
import { Trans } from "react-i18next";
import { Card, Image, Button } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { GET_CONTACT_INFO } from "/imports/client/views/tenderify/utils/queries";
import ContactModal from "./modals/Contact";
// Template.TenderifySectionAccessControl.helpers({
//   user(userId) {
//     return User.first({ _id: userId });
//   },
//   roleLabel(contact) {
//     return contact.role;
//   },
//   updateContact() {
//     const { bid, onSave } = Template.instance().data;
//     const contacts = oPath(["contacts"], bid) || [];
//     return (data, index) => {
//       if (index != null) {
//         contacts[index] = data;
//       } else {
//         contacts.push(data);
//       }
//       return onSave({ contacts });
//     };
//   },
//   deleteContact() {
//     const { bid, onSave } = Template.instance().data;
//     const contacts = oPath(["contacts"], bid) || [];
//     return index => {
//       contacts.splice(index, 1);
//       return onSave({ contacts });
//     };
//   },
//   footerButton(updateContact) {
//     return {
//       template: "TenderifyContactModal",
//       button: <Trans i18nKey="tenderify.accessControl.add" />,
//       data: {
//         title: <Trans i18nKey="tenderify.accessControl.modal.title" />,
//         disabled: false,
//         callback: updateContact
//       }
//     };
//   }
// });

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

        {/* TODO [$6130a08837762e00094fd3e0]: update translation */}
        <Trans i18nKey={`tender.contact.roles.${contact.role}`} />
      </Card.Content>
    </Card>
  );
};

const TenderifySectionAccessControl = ({ tenderBid, security, onSave }) => {
  const [modalState, setModalstate] = useState({ show: false });
  const showModal = show => setModalstate({ ...modalState, show });

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

    // TODO : check if we need to strip values:
    return onSave({ contacts: mod }, () => showModal(false));
  };

  return (
    <IconSegment
      name="accessControl"
      icon="users"
      title={<Trans i18nKey="tenderify.accessControl.title" />}
      body={
        <>
          <Card.Group stackable itemsPerRow={3}>
            {(tenderBid.contacts || []).map((contact, index) => (
              <ContactCard
                key={`contactCard-${index}`}
                {...{ contact, index, setModalstate, canEdit: security.editContacts }}
              />
            ))}
          </Card.Group>
          <ContactModal
            {...modalState}
            isLocked={!security.editContacts}
            onSave={updateContact}
            onDelete={deleteContact}
            showModal={showModal}
          />
        </>
      }
      footer={
        security.editContacts ? (
          <Button primary content={<Trans i18nKey="tenderify.accessControl.add" />} />
        ) : null
      }
    />
  );
};

export default TenderifySectionAccessControl;
