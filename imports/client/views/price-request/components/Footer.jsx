import React, { useContext, useState } from "react";
import get from "lodash.get";
import { toast } from "react-toastify";

import { useApolloClient } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";

import { Segment, Button, Popup } from "semantic-ui-react";
import { ConfirmComponent } from "/imports/client/components/modals/confirm";

import { mutate } from "/imports/utils/UI/mutate";

import { UPDATE_PRICE_REQUEST_STATUS, ADD_MATCHING_BIDDERS } from "../utils/queries";
import useRoute from "/imports/client/router/useRoute";
import LoginContext from "/imports/client/context/loginContext";

const debug = require("debug")("priceRequest:UI:footer");

const REQUIRED_ACCOUNT_FEATURE = "price-list";

const PriceRequestFooter = ({ security }) => {
  const { account } = useContext(LoginContext);
  const { goRoute, params } = useRoute();
  const { t } = useTranslation();
  const client = useApolloClient();
  const [confirmState, setConfirmState] = useState({ show: false });
  const showConfirm = show => setConfirmState({ ...confirmState, show });
  const hasFeature = account.hasFeature(REQUIRED_ACCOUNT_FEATURE);
  const priceRequestId = params._id;

  // checks what reason is it can't be released:
  const { hasBidders, hasBiddingItems, isNotExpired, ...ownerChecks } =
    security.canBeRequestedChecks || {};
  const couldRelease = Object.values(ownerChecks).every(x => x);

  function updateStatus(action) {
    debug("updating status to: %s", action);
    mutate(
      {
        client,
        query: {
          mutation: UPDATE_PRICE_REQUEST_STATUS,
          variables: { input: { priceRequestId, action } }
        },
        successMsg: t(`price.request.${action}.onSuccessMsg`),
        errorMsg: t(`price.request.${action}.onErrorMsg`)
      },
      () => showConfirm(false)
    );
  }

  function confirmRelease() {
    setConfirmState({
      show: true,
      content: t("price.request.request.confirm"),
      onConfirm: () => updateStatus("request")
    });
  }
  function confirmSetToDraft() {
    setConfirmState({
      show: true,
      content: t("price.request.setToDraft.confirm"),
      onConfirm: () => updateStatus("setToDraft")
    });
  }
  function confirmArchive() {
    setConfirmState({
      show: true,
      content: t("price.request.archive.confirm"),
      onConfirm: () => updateStatus("archive")
    });
  }
  function confirmDelete() {
    setConfirmState({
      show: true,
      content: t("price.request.delete.confirm"),
      onConfirm: () => updateStatus("delete")
    });
  }
  function confirmAutoAdd() {
    setConfirmState({
      show: true,
      content: t("price.request.autoAdd.confirm"),
      onConfirm: () =>
        mutate(
          {
            client,
            query: {
              mutation: ADD_MATCHING_BIDDERS,
              variables: { priceRequestId }
            },
            startMsg: "start auto add...",
            errorMsg: t("price.request.autoAdd.errorMsg")
          },
          data => {
            debug("auto add data %o", data);
            const qtyToAdd = get(data, "addMatchingBiddersPriceRequest.bestPartners.length", 0);
            const qty = get(data, "addMatchingBiddersPriceRequest.selectedPartners.length", 0);
            const onSuccessMsg = t("price.request.autoAdd.onSuccessMsg", { qty, qtyToAdd });

            toast.success(onSuccessMsg);
            showConfirm(false);
          }
        )
    });
  }

  return (
    <>
      <Segment as="footer" className="actions locked">
        <div>
          {hasFeature && (
            <Button
              primary
              icon="arrow left"
              content={<Trans i18nKey="form.back" />}
              onClick={() => goRoute("priceRequests")}
            />
          )}

          {/* sets the status to requested & becomes visible for carriers... */}
          {couldRelease && (
            <Popup
              inverted
              disabled={hasBidders && hasBiddingItems && isNotExpired}
              content={
                <>
                  {!hasBidders && (
                    <p>
                      <Trans i18nKey="price.request.request.noBidders" />
                    </p>
                  )}
                  {!hasBiddingItems && (
                    <p>
                      <Trans i18nKey="price.request.request.noItems" />
                    </p>
                  )}
                  {!isNotExpired && (
                    <p>
                      <Trans i18nKey="price.request.request.isExpired" />
                    </p>
                  )}
                </>
              }
              trigger={
                <div style={{ display: "inline-block" }}>
                  <Button
                    primary
                    icon="send"
                    disabled={!(hasBidders && hasBiddingItems && isNotExpired)}
                    content={<Trans i18nKey="price.request.request.action" />}
                    onClick={confirmRelease}
                  />
                </div>
              }
            />
          )}

          {security.canBeSetBackToDraft && (
            <Button
              basic
              data-test="setToDraft"
              content={<Trans i18nKey="price.request.setToDraft.action" />}
              onClick={confirmSetToDraft}
            />
          )}

          {/* sets status to archived (owner can do this) */}
          {security.canBeArchived && (
            <Button
              basic
              content={<Trans i18nKey="price.request.archive.action" />}
              onClick={confirmArchive}
            />
          )}

          {/* auto add carriers based on the lanes*/}
          {security.canAddPartners && (
            <Button
              basic
              color="red"
              content={<Trans i18nKey="price.request.autoAdd.action" />}
              onClick={confirmAutoAdd}
            />
          )}

          {/* removes the request , cancel request for bidders (owner can do this)*/}
          {security.canBeRequested && (
            <Button
              basic
              color="red"
              content={<Trans i18nKey="price.request.delete.action" />}
              onClick={confirmDelete}
            />
          )}
        </div>
      </Segment>
      <ConfirmComponent {...confirmState} showConfirm={showConfirm} />
    </>
  );
};

export default PriceRequestFooter;
