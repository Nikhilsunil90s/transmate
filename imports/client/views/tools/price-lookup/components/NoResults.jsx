import React from "react";
import { Trans } from "react-i18next";
import { Segment, Header, Icon, Button } from "semantic-ui-react";

const PriceLookupEmpty = () => (
  <Segment placeholder>
    <Header icon>
      <Icon name="search" />
      <Trans i18nKey="tools.priceLookup.empty" />
    </Header>
    <Button primary content={<Trans i18nKey="tools.priceLookup.requestnew" />} />
  </Segment>
);

export default PriceLookupEmpty;
