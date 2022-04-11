import React from "react";
import { Trans } from "react-i18next";

import { Segment, Button } from "semantic-ui-react";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

const InvoiceFooter = ({ security = {} }) => {
  const { canArchive, canDelete, canSettle } = security;

  return (
    <Segment as="footer">
      <div>
        <Button
          primary
          icon="arrow left"
          content={<Trans i18nKey="form.back" />}
          href={generateRoutePath("invoice-overview")}
        />
        {canSettle && (
          <Button primary content={<Trans i18nKey="partner.billing.invoice.actions.settle" />} />
        )}
        {canArchive && (
          <Button basic content={<Trans i18nKey="partner.billing.invoice.actions.archive" />} />
        )}
        {canDelete && (
          <Button
            color="red"
            basic
            content={<Trans i18nKey="partner.billing.invoice.actions.delete" />}
          />
        )}
      </div>
    </Segment>
  );
};

export default InvoiceFooter;
