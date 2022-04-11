import React from "react";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoForm } from "uniforms-semantic";

import PageHolder from "../../utilities/PageHolder";
import AddressInput from "./Address.jsx";

export default {
  title: "Components/Forms/addressInput"
};

const dummyProps = {
  data: {
    book: [
      { id: "addressId1", name: "test 1", format: "dummy address..." },
      { id: "addressId2", name: "test 2", format: "dummy address..." },
      { id: "addressId3", name: "test 3", format: "dummy address..." },
      { id: "addressId4", name: "test 4", format: "dummy address..." }
    ],
    global: [
      { id: "addressId5", name: "global 1", format: "dummy address..." },
      { id: "addressId6", name: "global 2", format: "dummy address..." },
      { id: "addressId7", name: "global 3", format: "dummy address..." },
      { id: "addressId8", name: "global 4", format: "dummy address..." }
    ],
    locations: []
  }
};

// as part of a uniforms:
export const basic = () => {
  const { data } = dummyProps;

  return (
    <PageHolder main="AccountPortal">
      <AutoForm
        schema={
          new SimpleSchema2Bridge(
            new SimpleSchema({
              address: { type: String }
            })
          )
        }
      >
        <AddressInput
          fixedData={data}
          name="address"
          label="Address"
          placeholder="Search address"
          required
        />
      </AutoForm>
    </PageHolder>
  );
};
