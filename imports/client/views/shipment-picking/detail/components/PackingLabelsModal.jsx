/* eslint-disable no-shadow */
import React, { useState } from "react";
import { Button, List } from "semantic-ui-react";
import { useQuery, useMutation } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ModalComponent, ModalActionsClose } from "/imports/client/components/modals";
import { GET_SHIPMENT_LABEL_OPTIONS, CONFIRM_SHIPMENT_LABEL_OPTION } from "../../utils/queries";
import PackingLabelOption from "./PackingLabelOption";

const debug = require("debug")("picking:UI");

const PackingLabelsModal = ({ packingItemIds, onCompleted }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const [selectLabelOption, { loading: mLoading }] = useMutation(CONFIRM_SHIPMENT_LABEL_OPTION);
  const { data = {}, loading, error } = useQuery(GET_SHIPMENT_LABEL_OPTIONS, {
    fetchPolicy: "no-cache",
    variables: {
      packingItemIds
    }
  });

  debug("options for labels: %o", { data, error });

  const openModal = () => setOpen(true);

  const { labelOptions = [] } = data;
  const sortedLabelOptions = labelOptions.sort((a, b) => a.amountLocal - b.amountLocal);
  const fastestValue = Math.min.apply(
    null,
    labelOptions.map(({ days = 0 }) => days)
  );
  const cheapestValue = Math.min.apply(
    null,
    labelOptions.map(({ amountLocal = 0 }) => amountLocal)
  );

  const onSelectItem = async rateOptionId => {
    const rate = labelOptions.find(({ rateId }) => rateId === rateOptionId);
    debug("confirming option %o", rate);
    try {
      const { data: mData = {}, errors } = await selectLabelOption({
        variables: {
          input: {
            packingItemIds,
            rateOptionId,
            rate
          }
        }
      });

      if (errors) throw errors;
      if (!mData.confirmShipmentLabelOption?.labelUrl) throw new Error("No label was returned");

      window.open(mData.confirmShipmentLabelOption?.labelUrl);
      if (typeof onCompleted === "function") onCompleted();
    } catch (error) {
      console.error(error);
      toast.error("Could not confirm label option");
    }
  };

  return (
    <>
      <Button
        onClick={openModal}
        disabled={loading}
        size="large"
        primary
        content={<Trans i18nKey="picking.btn_getLabels">Get labels</Trans>}
      />

      <ModalComponent
        title={t("picking.optionsTitle")}
        size="large"
        show={open}
        showModal={setOpen}
        body={
          <List divided verticalAlign="middle" className="ts-shipment-pick__list">
            {!sortedLabelOptions.length && <Trans i18nKey="picking.optionsEmtpy" />}
            {sortedLabelOptions.map((label, index) => (
              <PackingLabelOption
                key={index}
                label={label}
                disabled={mLoading}
                isFastest={fastestValue === label.days}
                isCheapest={cheapestValue === Number(label.amountLocal)}
                onSelect={onSelectItem}
              />
            ))}
          </List>
        }
        actions={
          <ModalActionsClose
            {...{
              showModal: setOpen
            }}
          />
        }
      />
    </>
  );
};

export default PackingLabelsModal;
