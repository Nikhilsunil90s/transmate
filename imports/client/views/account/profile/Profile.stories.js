import React from "react";

import PageHolder from "../../../components/utilities/PageHolder";
import AccountProfileSegments from "./Profile.jsx";

export default {
  title: "Account/Profile/partner"
};

const dummyProps = {
  profile: {
    accountId: "S12345",
    type: "carrier",
    name: "Test account",
    description: "test account text",
    logo: "//files.transmate.eu/logos/C75701/PQn",
    banner: "//files.transmate.eu/banners/C75701/qz6",
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
    ],
    contacts: [
      {
        type: "general",
        firstName: "First",
        lastName: "Last",
        mail: "test@test.com",
        phone: "+32 45678123",
        avatar: "//assets.transmate.eu/app/placeholder-user.png"
      },
      {
        type: "sales",
        firstName: "First",
        lastName: "Last",
        mail: "test2@test.com",
        phone: "+32 45678123",
        avatar: "//assets.transmate.eu/app/placeholder-user.png"
      }
    ],
    websites: [{ name: "test", url: "http://www.test.com" }],
    services: ["warehouse", "transport", "customs"],
    footprint: []
  },
  onSaveAction: () => {},
  canEdit: false,
  isOwnAccount: false,
  refreshData: () => {}
};

export const basic = () => (
  <PageHolder main="Partner">
    <AccountProfileSegments {...dummyProps} />
  </PageHolder>
);

export const canEdit = () => {
  const props = { ...dummyProps };
  props.canEdit = true;
  return (
    <PageHolder main="Partner">
      <AccountProfileSegments {...props} />
    </PageHolder>
  );
};

// export const empty = () => {
//   const props = { ...dummyProps };
//   props.profile = {
//     accountId: "S12345",
//     locations: [],
//     contacts: []
//   };
//   return (
//     <PageHolder main="AccountPortal">
//       <AccountProfileSegments {...props} />
//     </PageHolder>
//   );
// };
