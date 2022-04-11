/* eslint-disable no-use-before-define */
import React from "react";
import { Trans } from "react-i18next";

import { Segment, Header, Icon } from "semantic-ui-react";

const AccessDeniedPlaceholder = () => {
  return (
    <Segment
      padded="very"
      placeholder
      content={
        <Header icon>
          <Icon name="lock" />
          <Trans i18nKey="shipment.access.denied" />
        </Header>
      }
    />
  );
};

export default AccessDeniedPlaceholder;
