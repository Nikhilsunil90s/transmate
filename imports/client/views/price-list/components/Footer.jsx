import React, { useContext, useState } from "react";
import { useMutation } from "@apollo/client";
import { Trans } from "react-i18next";
import { Segment, Button } from "semantic-ui-react";
import { ConfirmComponent } from "/imports/client/components/modals/confirm";
import { sAlertCallback } from "/imports/utils/UI/sAlertCallback";

import { SAVE_PRICE_LIST_STATUS } from "../utils/queries";
import useRoute from "/imports/client/router/useRoute";
import LoginContext from "/imports/client/context/loginContext";

const REQUIRED_ACCOUNT_FEATURE = "price-list";

const statusText = priceList => {
  if (priceList?.validTo < new Date()) {
    return (
      <Trans
        i18nKey="price.list.footer.status"
        value={<Trans i18nKey="price.list.footer.expired" />}
      />
    );
  }

  // if (["draft", "requested"].includes(priceList?.status)) {
  //   return <Trans i18nKey={"price.list.footer.autosave"} />;
  // }
  if (priceList?.status === "for-approval") {
    return (
      <Trans
        i18nKey="price.list.footer.status"
        value={<Trans i18nKey="price.list.footer.approval" />}
      />
    );
  }
  return "";
};

const PriceListFooter = ({ ...props }) => {
  const { account } = useContext(LoginContext);
  const { goRoute } = useRoute();
  const [savePriceListStatus] = useMutation(SAVE_PRICE_LIST_STATUS);
  const [confirmState, setConfirmState] = useState({ show: false });
  const showConfirm = show => setConfirmState({ ...confirmState, show });

  const { security = {}, priceList, redirect } = props;
  const hasFeature = account.hasFeature(REQUIRED_ACCOUNT_FEATURE);
  const priceListId = priceList.id;

  //#region footerActions
  function confirmRelease() {
    setConfirmState({
      show: true,
      content: "Are you sure you want to release?",
      onConfirm: async () => {
        const { data, error } = await savePriceListStatus({
          variables: { input: { priceListId, action: "release" } }
        });

        const onSuccessMsg = "Price list is released and awaiting approval";
        const onSuccessCb = () => {
          showConfirm(false);
        };
        sAlertCallback(error, data, { onSuccessMsg, onSuccessCb });
      }
    });
  }

  function confirmApprove() {
    setConfirmState({
      show: true,
      onConfirm: async () => {
        const { data, error } = await savePriceListStatus({
          variables: { input: { priceListId, action: "approve" } }
        });

        const onSuccessMsg = "Price list is approved.";
        const onSuccessCb = () => {
          showConfirm(false);
        };
        sAlertCallback(error, data, { onSuccessMsg, onSuccessCb });
      }
    });
  }

  function confirmDecline() {
    setConfirmState({
      show: true,
      onConfirm: async () => {
        const { data, error } = await savePriceListStatus({
          variables: { input: { priceListId, action: "decline" } }
        });
        const onSuccessMsg = "Price list request has been declined";
        const onSuccessCb = () => {
          showConfirm(false);
        };
        sAlertCallback(error, data, { onSuccessMsg, onSuccessCb });
      }
    });
  }

  function confirmDeactivate() {
    setConfirmState({
      show: true,
      content: <Trans i18nKey="price.list.deactivate.confirm" />,
      onConfirm: async () => {
        const { data, error } = await savePriceListStatus({
          variables: { input: { priceListId, action: "deactivate" } }
        });
        const onSuccessMsg = "Price list request has been deactivated";
        const onSuccessCb = () => {
          showConfirm(false);
        };
        sAlertCallback(error, data, { onSuccessMsg, onSuccessCb });
      }
    });
  }

  function confirmDraft() {
    setConfirmState({
      show: true,
      content: <Trans i18nKey="price.list.draft.confirm" />,
      onConfirm: async () => {
        const { data, error } = await savePriceListStatus({
          variables: { input: { priceListId, action: "draft" } }
        });
        const onSuccessMsg = "Price list request has been set to draft";
        const onSuccessCb = () => {
          showConfirm(false);
        };
        sAlertCallback(error, data, { onSuccessMsg, onSuccessCb });
      }
    });
  }

  function confirmActivate() {
    setConfirmState({
      show: true,
      content: <Trans i18nKey="price.list.activate.confirm" />,
      onConfirm: async () => {
        const { data, error } = await savePriceListStatus({
          variables: { input: { priceListId, action: "activate" } }
        });
        const onSuccessMsg = "Price list request has been activated";
        const onSuccessCb = () => {
          showConfirm(false);
        };
        sAlertCallback(error, data, { onSuccessMsg, onSuccessCb });
      }
    });
  }

  function confirmArchive() {
    setConfirmState({
      show: true,
      content: <Trans i18nKey="price.list.archive.confirm" />,
      onConfirm: async () => {
        const { data, error } = await savePriceListStatus({
          variables: { input: { priceListId, action: "archive" } }
        });
        const onSuccessMsg = "Price list has been archived";
        const onSuccessCb = () => {
          showConfirm(false);
        };
        sAlertCallback(error, data, { onSuccessMsg, onSuccessCb });
      }
    });
  }

  function confirmDelete() {
    setConfirmState({
      show: true,
      content: <Trans i18nKey="price.list.delete.confirm" />,
      onConfirm: async () => {
        const { data, error } = await savePriceListStatus({
          variables: { input: { priceListId, action: "delete" } }
        });
        const onSuccessMsg = "Price list request has been deleted";
        const onSuccessCb = () => {
          goRoute("priceLists");
          showConfirm(false);
        };
        sAlertCallback(error, data, { onSuccessMsg, onSuccessCb });
      }
    });
  }

  //#endregion

  return (
    <Segment as="footer" className="actions locked">
      <div>
        {hasFeature && (
          <Button
            primary
            icon="arrow left"
            content={<Trans i18nKey="form.back" />}
            onClick={() => goRoute(redirect || "priceLists")}
          />
        )}
        {security.canBeReleased && (
          <Button
            primary
            icon="checkmark"
            content={<Trans i18nKey="price.list.releaseForApproval.action" />}
            onClick={confirmRelease}
            data-test="PriceListReleaseBtn"
          />
        )}
        {security.canBeApproved && (
          <Button
            primary
            icon="checkmark"
            content={<Trans i18nKey="price.list.approve.action" />}
            onClick={confirmApprove}
          />
        )}
        {security.canBeApproved && (
          <Button
            content={<Trans i18nKey="price.list.decline.action" />}
            onClick={confirmDecline}
          />
        )}
        {security.canBeSetBackToDraft && (
          <Button
            primary
            content={<Trans i18nKey="price.list.draft.action" />}
            onClick={confirmDraft}
            data-test="PriceListToDraftBtn"
          />
        )}
        {security.canBeDeactivated && (
          <Button
            basic
            content={<Trans i18nKey="price.list.deactivate.action" />}
            onClick={confirmDeactivate}
          />
        )}

        {security.canBeArchived && (
          <Button
            content={<Trans i18nKey="price.list.archive.action" />}
            onClick={confirmArchive}
          />
        )}
        {security.canBeActivated && (
          <Button
            content={<Trans i18nKey="price.list.activate.action" />}
            onClick={confirmActivate}
            data-test="PriceListActivateBtn"
          />
        )}
        {security.canBeDeleted && (
          <Button
            basic
            color="red"
            content={<Trans i18nKey="price.list.delete.action" />}
            onClick={confirmDelete}
            data-test="PriceListDeleteBtn"
          />
        )}
      </div>
      <div className="status">{statusText(priceList)}</div>
      <ConfirmComponent {...confirmState} showConfirm={showConfirm} />
    </Segment>
  );
};

export default PriceListFooter;
