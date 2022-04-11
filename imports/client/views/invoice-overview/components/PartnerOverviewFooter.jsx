import React from "react";
import { Button, Icon, Popup } from "semantic-ui-react";
import { Trans } from "react-i18next";
import useRoute from "/imports/client/router/useRoute";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

const PartnerOverviewFooter = () => {
  return (
    <>
      <CreatePartnerButton />
      <ViewDirectoryButton />
      <ImportPartnersButton />
    </>
  );
};

const CreatePartnerButton = () => {
  return (
    <Button primary icon id="addPartnerBtn">
      <Icon name="circle add" />
      <Trans i18nKey="partner.add" />
    </Button>
  );
};

const ViewDirectoryButton = () => {
  const { goRoute } = useRoute();
  const gotoDirectory = () => goRoute("directory");

  return (
    <Button basic primary icon id="gotoDirectory" onClick={gotoDirectory}>
      <Icon name="address book" />
      <Trans i18nKey="partner.directory.button" />
    </Button>
  );
};

const ImportPartnersButton = () => {
  return (
    <Popup
      content={<Trans i18nKey="partner.import.tooltip" />}
      trigger={
        <Button
          as="a"
          basic
          data-test="importPartners"
          href={generateRoutePath("partnerImport")}
          icon="address book"
          content={<Trans i18nKey="partner.import.button" />}
        />
      }
    />
  );
};

export default PartnerOverviewFooter;
