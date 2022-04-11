import React, { useContext, useState } from "react";
import { Button, Icon, Popup } from "semantic-ui-react";
import { Trans } from "react-i18next";
import { CheckAddressSecurity } from "/imports/utils/security/checkUserPermissionsForAddress";
import NewAddressModal from "./NewAddressModal";
import LoginContext from "/imports/client/context/loginContext";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("address:overview");

const REQUIRED_ACCOUNT_FEATURE = "location";

const AddressFooterButtons = () => {
  return <CreateAddressButtons />;
};

const CreateAddressButtons = () => {
  const { userId, account, accountId, roles } = useContext(LoginContext);
  const [show, showModal] = useState(false);

  const canCreateAddress = account.hasFeature(REQUIRED_ACCOUNT_FEATURE);
  const userCanCreateAddress = new CheckAddressSecurity({}, { userId, accountId })
    .setContext({ userId, accountId, roles })
    .can({ action: "createAddress" })
    .check();

  const { goRoute } = useRoute();

  debug("can create shipments: %s", userCanCreateAddress);

  // const openPriceListCreation = () => FlowRouter.go("newPriceList");
  // const requestPriceListCreation = () => requestForFeature(feature);

  const openImportFileList = () => goRoute("addressImport");

  return (
    <>
      <Popup
        content="Add new address"
        disabled={userCanCreateAddress}
        trigger={
          <Button primary id="createAddress" onClick={() => showModal(true)}>
            <Icon name="circle add" />
            <Trans i18nKey="address.add" />
          </Button>
        }
      />
      <NewAddressModal {...{ show, showModal }} />
      {canCreateAddress && (
        <Popup
          content={<Trans i18nKey="address.import.tooltip" />}
          trigger={
            <Button basic primary onClick={openImportFileList}>
              <Icon name="upload" />
              <Trans i18nKey="price.list.overview.import" />
            </Button>
          }
        />
      )}
    </>
  );
};

export default AddressFooterButtons;
