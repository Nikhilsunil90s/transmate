import { toast } from "react-toastify";
import React, { useContext, useState } from "react";
import { useMutation } from "@apollo/client";
import { Button, Icon, Popup } from "semantic-ui-react";
import { Trans } from "react-i18next";

import { CREATE_PRICELIST } from "/imports/client/views/price-list-overview/utils/queries";
import SelectTemplateModal from "../../price-list/components/TemplateModal";
import UpgradePopup from "/imports/client/components/popup/Upgrade";
import useRoute from "/imports/client/router/useRoute";
import LoginContext from "/imports/client/context/loginContext";

const debug = require("debug")("price-list");

const REQUIRED_ACCOUNT_FEATURE_PRICE_LIST = "price-list-create";
const REQUIRED_ACCOUNT_FEATURE_PRICE_LIST_REQUEST = "price-list-request";
const REQUIRED_ACCOUNT_FEATURE_PRICE_LOOKUP = "price-lookup";

const PriceListFooterButtons = () => {
  return (
    <>
      <AddPriceListButton />
      <RequestPriceListButton />
      <LookupPriceListButton />
    </>
  );
};
const AddPriceListButton = () => {
  const { account } = useContext(LoginContext);
  const { goRoute } = useRoute();
  const [show, showModal] = useState(false);
  const canCreatePriceList = account.hasFeature(REQUIRED_ACCOUNT_FEATURE_PRICE_LIST);

  const [createPriceList] = useMutation(CREATE_PRICELIST);

  const createPriceListAction = () => showModal(true);

  const afterSelectPriceListTemplate = async ({ ...inputData }) => {
    debug("new pricelist", inputData);
    const { data = {}, loading: isMutationLoading, error: mutationError } = await createPriceList({
      variables: { input: inputData }
    });
    debug("creating a pricelist: %o", {
      data,
      isMutationLoading,
      mutationError
    });

    if (mutationError) return console.error("change node error", mutationError);
    if (isMutationLoading) return null;
    if (!data.createPriceList.id) return toast.error("Could not create a priceList");

    return goRoute("priceList", { _id: data.createPriceList?.id, section: "general" });
  };

  const openImportFileList = () => goRoute("newPriceListImport");

  return (
    <>
      {canCreatePriceList ? (
        <Button
          primary
          onClick={createPriceListAction}
          icon="circle add"
          content={<Trans i18nKey="price.list.overview.add" />}
          data-test="createPriceListBtn"
        />
      ) : (
        <UpgradePopup
          trigger={
            <Button
              primary
              icon="circle add"
              content={<Trans i18nKey="price.list.overview.add" />}
              data-test="createPriceListBtn"
            />
          }
          reference={REQUIRED_ACCOUNT_FEATURE_PRICE_LIST}
        />
      )}

      {canCreatePriceList && (
        <Popup
          content="Upload price list from template"
          trigger={
            <Button basic primary onClick={openImportFileList}>
              <Icon name="upload" />
              <Trans i18nKey="price.list.overview.import" />
            </Button>
          }
        />
      )}
      <SelectTemplateModal {...{ show, showModal, onSave: afterSelectPriceListTemplate }} />
    </>
  );
};

const RequestPriceListButton = () => {
  const { account } = useContext(LoginContext);
  const { goRoute } = useRoute();
  const canRequestPriceList = account.hasFeature(REQUIRED_ACCOUNT_FEATURE_PRICE_LIST_REQUEST);

  const openPriceListRequest = () => goRoute("priceRequestNew");

  return canRequestPriceList ? (
    <Button
      basic
      primary
      onClick={openPriceListRequest}
      icon="circle add"
      content={<Trans i18nKey="price.list.overview.request" />}
    />
  ) : (
    <UpgradePopup
      trigger={
        <Button
          primary
          icon="circle add"
          content={<Trans i18nKey="price.list.overview.request" />}
        />
      }
      reference={REQUIRED_ACCOUNT_FEATURE_PRICE_LIST_REQUEST}
    />
  );
};

const LookupPriceListButton = () => {
  const { account } = useContext(LoginContext);
  const { goRoute } = useRoute();
  const canLookupPriceList = account.hasFeature(REQUIRED_ACCOUNT_FEATURE_PRICE_LOOKUP);

  const openPriceListLookup = () => goRoute("priceLookup");

  return canLookupPriceList ? (
    <Button
      basic
      primary
      onClick={openPriceListLookup}
      icon="calculator"
      content={<Trans i18nKey="price.list.overview.lookup" />}
    />
  ) : (
    <UpgradePopup
      trigger={
        <Button
          primary
          icon="circle add"
          content={<Trans i18nKey="price.list.overview.lookup" />}
        />
      }
      reference={REQUIRED_ACCOUNT_FEATURE_PRICE_LOOKUP}
    />
  );
};

export default PriceListFooterButtons;
