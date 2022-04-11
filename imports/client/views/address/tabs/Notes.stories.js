import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import AddressNotesTab from "./Notes";

export default {
  title: "Address/Tabs/notes"
};

export const ProfileTab = () => {
  const props = {
    security: { canEdit: true },
    address: {
      annotation: {
        name: "test",
        coding: {
          code: "codeTest",
          vendorId: "vendorId",
          ediId: "testEDI",
          color: "#604545"
        },
        notes:
          '[{"children":[{"text":"test "},{"text":"bold test","bold":true}]}]'
      },
      id: "BmCHPm8A2FH7nq6qw",
      street: "Roscheider Straße 1",
      zip: "54329",
      city: "Konz",
      state: "Trier-Saarburg",
      country: "Germany",
      countryCode: "DE",
      location: {
        lat: 49.70038,
        lng: 6.58137
      }
    },
    onSave(update, cb) {
      console.log(update);
      if (typeof cb === "function") cb();
    }
  };
  return (
    <PageHolder main="Address">
      <AddressNotesTab {...props} />
    </PageHolder>
  );
};
