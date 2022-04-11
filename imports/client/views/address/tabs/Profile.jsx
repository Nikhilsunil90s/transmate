import React from "react";

import {
  SafetySegment,
  HoursSegment,
  ContactSegment,
  ContactNotesSegment,
  LinkSegment
} from "../components";

const AddressProfileTab = ({ addressId, address = {}, security = {}, onSave, refetch }) => {
  const { annotation } = address;
  const { canEdit } = security;

  const segmentProps = { addressId, annotation, canEdit, onSave, refetch };
  return (
    <>
      <SafetySegment {...segmentProps} />
      {/* linked to an account */}
      {address?.annotation?.partnerId ? (
        <ContactSegment {...segmentProps} />
      ) : (
        <>
          <LinkSegment {...segmentProps} />
          <ContactNotesSegment {...segmentProps} />
        </>
      )}

      {/* non linked contacts: */}
      <HoursSegment {...segmentProps} />
      {/* <Certificates {...segmentProps} /> */}
    </>
  );
};

export default AddressProfileTab;
