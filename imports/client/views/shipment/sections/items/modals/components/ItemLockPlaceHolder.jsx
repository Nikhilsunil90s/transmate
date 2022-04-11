import React from "react";
import { Trans } from "react-i18next";

import { Segment, Header } from "semantic-ui-react";

const ItemPlaceHolderPane = () => (
  <Segment placeholder>
    <Header icon>
      <Trans i18nKey="shipment.form.item.locked" />
    </Header>
  </Segment>
);

export default ItemPlaceHolderPane;
