import React from "react";
import { useTranslation } from "react-i18next";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { Segment, Header, Button, Icon } from "semantic-ui-react";
import SelectPartnerModal from "/imports/client/components/modals/specific/partnerSelect.jsx";

const Placeholder = ({ annotation = {}, onSave }) => {
  const { t } = useTranslation();
  const onSelectPartner = ({ partnerId }) => {
    onSave({ partnerId });
  };
  return (
    <Segment placeholder>
      <Header icon>
        <Icon name="linkify" />
        {t("address.form.link.placeholder")}
      </Header>
      <br />
      <SelectPartnerModal value={annotation.partnerId} onSave={onSelectPartner}>
        <Button primary content={t("address.form.link.btn")} />
      </SelectPartnerModal>
    </Segment>
  );
};

const AccountLinkSegment = ({ ...props }) => {
  const { t } = useTranslation();
  return (
    <IconSegment
      title={t("address.form.link.title")}
      icon="linkify"
      body={props.canEdit ? <Placeholder {...props} /> : "Accounts not linked"}
    />
  );
};

export default AccountLinkSegment;
