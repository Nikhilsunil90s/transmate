import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import AddressInfoTab from "./Info";

export default {
  title: "Address/Tabs/info"
};

export const ProfileTab = () => {
  const props = {
    security: { canEdit: true },
    address: {
      annotation: {
        name: "test"
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
      <AddressInfoTab {...props} />
    </PageHolder>
  );
};
