import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import { AddressForm } from "./NewAddressModal.jsx";

export default {
  title: "Address/Components/modal"
};

// schema === addressSchema:

export const basic = () => {
  const props = { onSubmitForm: console.log };

  return (
    <MockedProvider>
      <PageHolder main="Address">
        <AddressForm {...props} />
      </PageHolder>
    </MockedProvider>
  );
};

// export const modal = () => {
//   const props = { ...dummyProps };
//   const location = addressToLocationType(props);
//   return (
//     <PageHolder main="Address">
//       <Segment>
//         <LocationTag
//           annotation={{ enable: true, accountId: "dummy" }}
//           location={location}
//         />
//       </Segment>
//     </PageHolder>
//   );
// };
