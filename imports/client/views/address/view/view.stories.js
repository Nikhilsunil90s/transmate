import React from "react";

import { Segment } from "semantic-ui-react";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import { AddressView } from "./View.jsx";
import LocationTag from "/imports/client/components/tags/LocationTag";
import { addressToLocationType } from "./helper";

export default {
  title: "Address/Components/view"
};

// schema === addressSchema:
const dummyProps = {
  _id: "QWjxrskYM8SNoeTPk",
  input: "MURRAY STREET, PA3 1QQ, PAISLEY, GB",
  street: "Murray Street",
  zip: "PA3 1",
  city: "Paisley",
  state: "Renfrewshire",
  country: "United Kingdom",
  countryCode: "GB",
  location: {
    lat: 55.85121,
    lng: -4.43671
  },
  validated: {
    by: "google"
  },
  bus: "",
  annotation: {
    id: "S94909",
    name: "CARGO",
    safety: {
      instructions: `[{"children":[{"text":""}]},{"children":[{"text":"      Please add your notes here"}]},{"children":[{"text":"    "}]}]`,
      pbm: ["feet", "hand", "head"]
    },
    contacts: [
      {
        type: "reception",
        title: "mr",
        firstName: "Daniel",
        lastName: "Varagic",
        mail: "daniel.varagic@doco.com",
        phone: "+43 664 807771185"
      }
    ],
    hours: `[{"children":[{"text":"09:00 - 17:00", "bold": true}]}]`
  }
};

export const basic = () => {
  const props = { ...dummyProps };
  const location = addressToLocationType(props);
  const { annotation } = props;

  return (
    <PageHolder main="Address">
      <Segment>
        <AddressView location={location} annotation={annotation} />
      </Segment>
    </PageHolder>
  );
};

export const modal = () => {
  const props = { ...dummyProps };
  const location = addressToLocationType(props);
  return (
    <PageHolder main="Address">
      <Segment>
        <LocationTag
          annotation={{ enable: true, accountId: "dummy" }}
          location={location}
        />
      </Segment>
    </PageHolder>
  );
};
