import { toast } from "react-toastify";
import { useApolloClient, useMutation } from "@apollo/client";
import { Trans } from "react-i18next";
import React, { useState } from "react";
import { Dropdown } from "semantic-ui-react";
import { DUPLICATE_PRICELIST, SAVE_PRICE_LIST_STATUS } from "../utils/queries";
import useRoute from "/imports/client/router/useRoute";
import { ConfirmComponent } from "/imports/client/components/modals/confirm";

const debug = require("debug")("priceList:overview");

// FIXME > on status change there is still a route going to the specific page.
const Actions = ({ priceList = {}, canEdit }) => {
  const { goRoute } = useRoute();
  const client = useApolloClient();
  const [savePriceListStatus] = useMutation(SAVE_PRICE_LIST_STATUS);
  const [confirmState, setConfirmState] = useState({ show: false });
  const showConfirm = show => setConfirmState({ ...confirmState, show });

  if (!canEdit || !priceList) return null;

  const { id: priceListId, status } = priceList;

  const handleMainDropDownClick = event => {
    event.stopPropagation();
  };

  async function duplicatePriceList(shouldDuplicateWithRate) {
    try {
      const { data = {}, errors } = await client.mutate({
        mutation: DUPLICATE_PRICELIST,
        variables: { input: { priceListId, rates: shouldDuplicateWithRate } }
      });
      if (errors) throw errors;
      debug("duplication mutation result", data);
      const newPriceListId = data.duplicatePriceList?.id;
      if (!newPriceListId) throw new Error("no priceListId returned");
      goRoute("priceList", { _id: newPriceListId });
    } catch (error) {
      console.error({ error });
      toast.error("price list could not be duplicated");
    }
  }

  function confirmDraft(event) {
    event.stopPropagation();
    setConfirmState({
      show: true,
      content: <Trans i18nKey="price.list.draft.confirm" />,
      onConfirm: () => {
        savePriceListStatus({
          variables: { input: { priceListId, action: "draft" } }
        })
          .then(() => {
            toast.success("Price list request has been set to draft");
            showConfirm(false);
            event.stopPropagation();
          })
          .catch(error => {
            console.error(error);
            toast.error("Could not set to draft");
          });
      }
    });
  }

  function confirmActivate(event) {
    setConfirmState({
      show: true,
      content: <Trans i18nKey="price.list.activate.confirm" />,
      onConfirm: () => {
        savePriceListStatus({
          variables: { input: { priceListId, action: "activate" } }
        })
          .then(() => {
            toast.success("Price list request has been activated");
            showConfirm(false);
            event.stopPropagation();
          })
          .catch(error => {
            console.error(error);
            toast.error("Could not set to draft");
          });
      }
    });
  }

  // todo prevent wide clicking
  return (
    <>
      <Dropdown
        onClick={handleMainDropDownClick}
        style={{ width: "100%", height: "100%" }}
        text=""
        pointing="right"
      >
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => duplicatePriceList(false)} text="Duplicate without rates" />
          <Dropdown.Item onClick={() => duplicatePriceList(true)} text="Duplicate with rates" />
          {status === "draft" && <Dropdown.Item onClick={confirmActivate} text="Activate" />}
          {status === "active" && <Dropdown.Item onClick={confirmDraft} text="Set to draft" />}
        </Dropdown.Menu>
      </Dropdown>
      <ConfirmComponent {...confirmState} showConfirm={showConfirm} />
    </>
  );
};

export default Actions;
