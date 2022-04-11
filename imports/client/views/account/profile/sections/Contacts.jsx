import { toast } from "react-toastify";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Item, Button, Label, Popup } from "semantic-ui-react";
import PropTypes from "prop-types";
import pick from "lodash.pick";

import { useApolloClient } from "@apollo/client";
import ContactModal from "../modals/Contact.jsx";
import { IconSegment } from "../../../../components/utilities/IconSegment";

import { ConfirmComponent } from "/imports/client/components/modals/confirm";

import { contactTypes } from "/imports/api/_jsonSchemas/fixtures/account-profile.json";
import { CREATE_USER_BY_CONTACT } from "../../queries.js";

const debug = require("debug")("account:annotation");

export const ContactOverview = ({
  contacts = [],
  saveContacts,
  canEdit,
  disableInvite,
  partnerId
}) => {
  const client = useApolloClient();
  const { t } = useTranslation();
  const [confirmData, setConfirmData] = useState({ show: false });
  const showConfirm = show => setConfirmData({ ...confirmData, show });

  const [modalData, setModalData] = useState({ show: false });
  const showModal = show => setModalData({ ...modalData, show });

  const hasContacts = contacts.length > 0;

  const handleDelete = index => {
    setConfirmData({
      show: true,
      onConfirm: () => {
        contacts.splice(index, 1);
        saveContacts({ contacts }, () => showConfirm(false));
      }
    });
  };

  const handleInvite = index => {
    const contact = pick(contacts[index], [
      "mail",
      "firstName",
      "lastName",
      "phone",
      "linkedId",
      "contactType"
    ]);
    debug("inviting %o", contact);
    setConfirmData({
      show: true,
      showConfirm,
      onConfirm: async () => {
        try {
          const { errors } = await client.mutate({
            mutation: CREATE_USER_BY_CONTACT,
            variables: {
              input: {
                partnerId,
                contact,
                options: { sendInvite: true }
              }
            }
          });
          if (errors && errors.length) throw errors[0];
          toast.success("Invite sent");
          showConfirm(false);
        } catch (error) {
          // console.error(error);
          toast.error(error.message);
        }
      }
    });
  };

  const updateUser = contactMod => {
    const { index } = modalData;
    contacts[index] = contactMod;
    saveContacts({ contacts });
  };

  return (
    <>
      {hasContacts ? (
        <Item.Group divided>
          {contacts.map((contact, index) => (
            <ContactItem
              key={index}
              {...{
                contact,
                index,
                canEdit,
                disableInvite,
                handleDelete,
                updateUser,
                handleInvite,
                setModalData
              }}
            />
          ))}
        </Item.Group>
      ) : (
        <div className="empty">{t("partner.profile.contacts.empty")}</div>
      )}
      <ConfirmComponent {...confirmData} showConfirm={showConfirm} />
      <ContactModal {...modalData} showModal={showModal} onSave={updateUser} />
    </>
  );
};

const ContactItem = ({
  contact,
  index,
  canEdit,
  disableInvite,
  handleDelete,
  handleInvite,
  setModalData
}) => {
  const { t } = useTranslation();
  const cType = contact.type || contact.contactType;
  return (
    <Item>
      <Item.Image size="tiny" src={contact.avatar} />
      <Item.Content>
        <Item.Header>
          {contact.lastName ? `${contact.lastName},` : ""} {contact.firstName}{" "}
          <span style={{ opacity: 0.5 }}>
            {" "}
            {contactTypes.includes(contact.type) || contactTypes.includes(contact.contactType)
              ? t(`account.profile.contacts.types.${cType}`)
              : cType}
          </span>{" "}
        </Item.Header>
        <Item.Description>
          {contact.mail} | {contact.phone}
        </Item.Description>
        <Item.Extra>
          {canEdit && !contact.isofficial && (
            <Button.Group basic floated="right" key="actions">
              <Popup
                trigger={
                  <Button
                    icon="pencil alternate"
                    onClick={() =>
                      setModalData({
                        show: true,
                        data: contact,
                        index
                      })
                    }
                  />
                }
                content={t("account.profile.contacts.edit")}
              />

              <Popup
                content={t("account.profile.contacts.remove")}
                trigger={
                  <Button icon="trash alternate outline" onClick={() => handleDelete(index)} />
                }
              />
            </Button.Group>
          )}
          {canEdit && !contact.isofficial && !disableInvite && (
            <Popup
              key="invite"
              content={t("account.profile.contacts.inviteTooltip")}
              trigger={
                <Button
                  icon="envelope outline"
                  content={t("account.profile.contacts.invite")}
                  labelPosition="left"
                  onClick={() => handleInvite(index)}
                />
              }
            />
          )}
          {contact.userId && <Label tag>{t(`account.profile.contacts.member`)}</Label>}
        </Item.Extra>
      </Item.Content>
    </Item>
  );
};

export const ContactFooter = ({ contacts = [], saveContacts }) => {
  const { t } = useTranslation();
  const [modalData, setModalData] = useState({ show: false });
  const showModal = show => setModalData({ ...modalData, show });

  const onAddPartner = newContact => {
    contacts.push(newContact);
    saveContacts({ contacts });
  };

  return (
    <>
      <Button
        primary
        icon="plus"
        size="mini"
        content={t("account.profile.contacts.add")}
        onClick={() => showModal(true)}
      />
      <ContactModal {...modalData} showModal={showModal} onSave={onAddPartner} />
    </>
  );
};

const ProfileContactSegment = ({ canEdit, onSave, contacts, partnerId }) => {
  const { t } = useTranslation();
  const contactList = (contacts || []).map(({ events, userId, __type, ...contact }) => contact);

  const saveContacts = ({ contacts: newContacts = [] }, cb) => {
    debug("saving contacts", newContacts);
    onSave({ contacts: newContacts.map(({ isOfficial, ...contact }) => contact) });
    if (typeof cb === "function") {
      cb();
    }
  };

  const segmentData = {
    name: "contacts",
    icon: "address book",
    title: t("account.profile.contacts.title"),
    body: (
      <>
        <ContactOverview {...{ contacts: contactList, saveContacts, canEdit, partnerId }} />
      </>
    ),
    ...(canEdit
      ? {
          footer: <ContactFooter {...{ saveContacts, contacts: contactList }} />
        }
      : undefined)
  };
  return <IconSegment {...segmentData} />;
};
ProfileContactSegment.propTypes = {
  canEdit: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  contacts: PropTypes.array,
  partnerId: PropTypes.string
};

export default ProfileContactSegment;
