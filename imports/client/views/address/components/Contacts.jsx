import React from "react";
import { useMutation } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import {
  ContactOverview,
  ContactFooter
} from "/imports/client/views/account/profile/sections/Contacts";
import PartnerTag from "/imports/client/components/tags/PartnerTag.jsx";

import { SAVE_ADDRESS_CONTACTS } from "../utils/queries";

// form deviates from account contacts form
// contacts are stored in account and are linked through the linked account Id
// step 1: link to partnerId
// setp 2: once linked, add/remove partners -> this is hotwired to account annotation

const debug = require("debug")("address:annotation");

const AddressContactsSegment = ({ addressId, refetch, annotation, canEdit }) => {
  const { t } = useTranslation();
  const { contactsLinked = [], partnerId } = annotation;

  const [saveAddressContacts] = useMutation(SAVE_ADDRESS_CONTACTS);

  // passes on all contacts that are linked to this address
  const saveContacts = async ({ contacts: updatedContacts }, cb) => {
    const {
      data: { saveAddressContacts: saveAddressContactsResult },
      loading: mutationLoading,
      error: mutationError
    } = await saveAddressContacts({
      variables: {
        input: {
          addressId,
          partnerId,
          contacts: updatedContacts
        }
      }
    });
    debug("contacts save them in account: %o", {
      saveAddressContactsResult,
      mutationLoading,
      mutationError
    });

    if (mutationError) {
      console.error("error", mutationError);
      return;
    }
    refetch();
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
        {t("account.profile.contacts.linkedPartner")}:{" "}
        <PartnerTag accountId={annotation.partnerId} />
        <ContactOverview {...{ contacts: contactsLinked, saveContacts, canEdit, partnerId }} />
      </>
    ),
    ...(canEdit
      ? {
          footer: (
            <div>
              <ContactFooter {...{ saveContacts, contacts: contactsLinked }} />
              {/* <Button basic primary content="unlink" onClick={()=> {}}/> */}
            </div>
          )
        }
      : undefined)
  };
  return <IconSegment {...segmentData} />;
};

export default AddressContactsSegment;
