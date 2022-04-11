import React from "react";

import PageHolder from "../../../../components/utilities/PageHolder";
import ProfileLocationSegment from "./Locations.jsx";

export default {
  title: "Account/Profile/Segments/locations"
};

const dummyProps = {
  profile: {
    accountId: "S12345",
    locations: [
      {
        _id: "zwLZA6uX5csTywQGy",
        street: "Vrijdagmarkt",
        number: "10",
        bus: "401",
        city: "Gent",
        zip: "9000",
        country: "Belgium",
        countryCode: "BE",
        location: {
          lat: 51.0567727,
          lng: 3.727091900000005
        },
        name: "Well Played",
        accounts: [
          {
            id: "C30016",
            name: "Well Played"
          }
        ],
        linkedAccounts: ["C30016"]
      },
      {
        _id: "zueNgMWRtW8ywCX8F",
        street: "St Andrew's Road",
        zip: "BS11 9HQ",
        city: "Bristol",
        country: "United Kingdom",
        countryCode: "GB",
        location: {
          lat: 51.50452,
          lng: -2.69736
        },
        bus: "",
        name: "Barry Shaddick Tyres Ltd Head Office",
        accounts: [
          {
            id: "S72581",
            name: "Barry Shaddick Tyres Ltd Head Offic"
          }
        ]
      }
    ]
  },
  onSaveAction: () => {},
  canEdit: true,
  refreshData: () => {}
};

export const basic = () => (
  <PageHolder main="AccountPortal">
    <ProfileLocationSegment {...dummyProps} />
  </PageHolder>
);

export const canEdit = () => {
  const props = { ...dummyProps };
  props.accessControl = () => true;
  return (
    <PageHolder main="AccountPortal">
      <ProfileLocationSegment {...props} />
    </PageHolder>
  );
};

export const empty = () => {
  dummyProps.profile.contacts = [];
  return (
    <PageHolder main="AccountPortal">
      <ProfileLocationSegment {...dummyProps} />
    </PageHolder>
  );
};
