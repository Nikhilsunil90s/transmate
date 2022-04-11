import React, { useState } from "react";
import get from "lodash.get";
import capitalize from "lodash.capitalize";
import { Button, Item, Popup, Label } from "semantic-ui-react";
import ContactModal from "/imports/client/views/account/profile/modals/Contact.jsx";
import { ConfirmComponent } from "/imports/client/components/modals";

const ContactItem = ({ contact: contactOrg, index, setModalState, canEdit, handleDelete }) => {
  const [first, last] = (contactOrg.name || "").split(" ", 1);
  const contact = {
    ...contactOrg,
    firstName: contactOrg.firstName || first,
    lastName: contactOrg.lastName || last,
    contactType: contactOrg.type
  };
  const showDelete = contact.status !== "doNotContact";
  const statusColor = contact.status === "doNotContact" ? "red" : "grey";

  return (
    <Item>
      <Item.Content>
        <Item.Header>
          {contact.lastName ? `${contact.lastName},` : ""} {contact.firstName}
          <span style={{ opacity: 0.5 }}>{contact.type}</span>{" "}
          <Label basic color={statusColor} key={statusColor} size="small">
            {capitalize(contact.status)}
          </Label>
        </Item.Header>
        <Item.Description>
          {contact.mail}
          {contact.phone && ` | ${contact.phone}`}
        </Item.Description>
        <Item.Extra>
          {canEdit && (
            <Button.Group basic floated="right" key="actions">
              <Popup
                trigger={
                  <Button
                    icon="pencil alternate"
                    onClick={() =>
                      setModalState({
                        show: true,
                        data: contact,
                        index
                      })
                    }
                  />
                }
                content="Edit"
              />
              {showDelete && (
                <Popup
                  content="Remove"
                  trigger={
                    <Button icon="trash alternate outline" onClick={() => handleDelete(index)} />
                  }
                />
              )}
            </Button.Group>
          )}
        </Item.Extra>
      </Item.Content>
    </Item>
  );
};

const ContactsTab = ({ profile = {}, canEdit, onSave }) => {
  const [confirmState, setConfirmState] = useState({ show: false });
  const [modalState, setModalState] = useState({ show: false });
  const showModal = show => setModalState({ ...modalState, show });
  const showConfirm = show => setConfirmState({ ...confirmState, show });

  const contacts = profile.contacts || [];
  const hasContacts = contacts.length > 0;

  function onSavecontacts(updatedCont) {
    const updatedContact = {
      ...updatedCont,
      type: updatedCont.contactType
    };
    const { index } = modalState;
    let contactMod = contacts;
    if (index > -1) {
      contactMod = contactMod.map((contact, i) => (i === index ? updatedContact : contact));
    } else {
      contactMod.push(updatedContact);
    }
    onSave({ contacts: contactMod }, () => {
      profile.contacts = contactMod;
      return showModal(false);
    });
  }
  function handleDelete(index) {
    setConfirmState({ show: true, index, mail: get(contacts, [index, "mail"]) });
  }
  function afterConfirmDelete() {
    // set as do not contact
    const contactMod = contacts.map((contact, i) =>
      i === confirmState.index ? { ...contact, status: "doNotContact" } : contact
    );
    onSave({ contacts: contactMod }, () => {
      profile.contacts = contactMod;
      return showConfirm(false);
    });
  }

  return (
    <>
      {!hasContacts ? (
        <p>No contact information available</p>
      ) : (
        <Item.Group>
          {contacts.map((contact, index) => (
            <ContactItem
              key={index}
              {...{
                contact,
                index,
                canEdit,
                handleDelete,
                setModalState
              }}
            />
          ))}
        </Item.Group>
      )}
      {canEdit && <Button content="add" onClick={() => setModalState({ show: true })} />}
      <ContactModal {...modalState} showModal={showModal} onSave={onSavecontacts} />
      <ConfirmComponent
        {...confirmState}
        showConfirm={showConfirm}
        onConfirm={afterConfirmDelete}
      />
    </>
  );
};

export default ContactsTab;
