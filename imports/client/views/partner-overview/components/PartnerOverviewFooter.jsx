import React, { useState } from "react";
import { Button, Icon, Popup } from "semantic-ui-react";
import { Trans } from "react-i18next";
import PartnerModal from "./NewPartnerModal";
import useRoute from "/imports/client/router/useRoute";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

const PartnerOverviewFooter = () => {
  const [show, showModal] = useState();
  const { goRoute } = useRoute();

  return (
    <>
      <Button primary icon data-test="addPartnerBtn" onClick={() => showModal(true)}>
        <Icon name="circle add" />
        <Trans i18nKey="partner.add" />
      </Button>
      <PartnerModal {...{ show, showModal }} />
      <Button basic primary icon data-test="gotoDirectory" onClick={() => goRoute("directory")}>
        <Icon name="address book" />
        <Trans i18nKey="partner.directory.button" />
      </Button>
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
    </>
  );
};

export default PartnerOverviewFooter;
