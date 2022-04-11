import { toast } from "react-toastify";
import React, { useContext } from "react";
import { Trans } from "react-i18next";
import { useMutation } from "@apollo/client";

import { Popup, Button } from "semantic-ui-react";

import priceRequestModal from "./modals/PriceRequestModal.jsx";
import { generateMessage } from "/imports/client/views/shipment/sections/costs/components/priceRequestGenerateMsg";
import { CREATE_PRICE_REQUEST, ADD_ITEMS_TO_PRICE_REQUEST } from "./queries";
import LoginContext from "/imports/client/context/loginContext";

const debug = require("debug")("shipment:overview-menu");

const MassPriceRequest = ({ getSelectedShipments }) => {
  const { roles } = useContext(LoginContext);
  const [createPriceRequest] = useMutation(CREATE_PRICE_REQUEST);
  const [addItemsToRequest] = useMutation(ADD_ITEMS_TO_PRICE_REQUEST);
  const canDoMassRequest = (roles || []).includes("core-priceRequest-createForShipmentMass");
  if (!canDoMassRequest) return null;

  function createOrModifyPriceRequest({ priceRequestId }, callback) {
    const selectedShipmentIds = getSelectedShipments(); // returns [{shipmentId:...}]
    debug("priceRequest.generate request: %o", selectedShipmentIds);
    let promise;
    if (priceRequestId) {
      promise = addItemsToRequest({
        variables: {
          input: {
            priceRequestId,
            items: selectedShipmentIds
          }
        }
      });
    } else {
      promise = createPriceRequest({
        variables: {
          type: "spot",
          title: "Grouped priceRequests ",
          items: selectedShipmentIds
        }
      });
    }
    promise
      .then(({ data, error, errors }) => {
        debug("mutation result %o", data);
        if (error || errors?.length > 0) {
          generateMessage(data);
          throw new Error(errors);
        }
        if (!data.result?.priceRequestId) throw new Error("No priceRequestId returned");

        callback(data.result.priceRequestId);
      })
      .catch(error => {
        toast.error("Could not generate price request");
        console.error({ error });
      });
  }

  const { setModalOpen, PriceRequestModal } = priceRequestModal({ createOrModifyPriceRequest });

  const triggerModal = () => setModalOpen(true);

  return (
    <>
      <Popup
        header={<Trans i18nKey="price.request.mass.button.tooltipHeader" />}
        content={<Trans i18nKey="price.request.mass.button.tooltip" />}
        trigger={<Button basic icon="gavel" onClick={triggerModal} />}
      />
      <PriceRequestModal />
    </>
  );
};

export default MassPriceRequest;
