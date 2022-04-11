import React from "react";
import { Button, Icon } from "semantic-ui-react";
import PageHolder from "../../utilities/PageHolder";
import SelectPartnerModal from "./partnerSelect";

const debug = require("debug")("partner:select:modal");

export default {
  title: "Components/modals/partnerSelect"
};

export const basic = () => {
  return (
    <PageHolder main="Shipment">
      <SelectPartnerModal
        onSave={data => {
          debug("data %o", data);
        }}
      >
        <Button primary>
          <Icon name="add" />
          Create
        </Button>
      </SelectPartnerModal>
    </PageHolder>
  );
};
