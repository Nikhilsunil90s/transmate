import React, { useContext, useState } from "react";
import get from "lodash.get";
import { toast } from "react-toastify";
import { useApolloClient } from "@apollo/client";

import { Button, Segment } from "semantic-ui-react";
import { Trans } from "react-i18next";
import { ConfirmComponent } from "/imports/client/components/modals/confirm";
import { CANCEL_SHIPMENT, UNCANCEL_SHIPMENT } from "../utils/queries";
import { generateRoutePath } from "/imports/client/router/routes-helpers";
import useRoute from "/imports/client/router/useRoute";
import LoginContext from "/imports/client/context/loginContext";

const debug = require("debug")("shipment:footer");

const ShipmentFooter = ({ ...props }) => {
  const [confirmState, setConfirmState] = useState({ show: false, action: null });
  const showConfirm = show => setConfirmState({ ...confirmState, show });
  const { shipmentId, shipment, security = {}, refetch } = props;
  const { canCancelShipment, canUnCancelShipment } = security;
  const { goRoute } = useRoute();
  const { user, roles } = useContext(LoginContext);

  const client = useApolloClient();

  const showBackToPickingButton =
    roles.includes("core-shipment-picking") &&
    shipment.pickup?.location?.addressId ===
      get(user, ["preferences", "picking", "addressId"], null);

  function onConfirm() {
    const { action } = confirmState;
    if (!action) return;
    debug(`action: ${action} triggered`);
    if (action === "cancel") {
      client
        .mutate({ mutation: CANCEL_SHIPMENT, variables: { shipmentId } })
        .then(({ errors }) => {
          if (errors) throw errors;
          goRoute("shipments");
          toast.success("Shipment canceled");
          showConfirm(false);
        })
        .catch(error => {
          console.error(error);
          toast.error(error);
        });
    }
    if (action === "toDraft") {
      client
        .mutate({ mutation: UNCANCEL_SHIPMENT, variables: { shipmentId } })
        .then(({ errors }) => {
          if (errors) throw errors;
          toast.success("Shipment set to draft");
          showConfirm(false);
          refetch();
        })
        .catch(error => {
          console.error(error);
          toast.error(error);
        });
    }
  }
  return (
    <Segment as="footer">
      <div>
        <Button
          as="a"
          primary
          icon="arrow left"
          id="close"
          content={<Trans i18nKey="form.back" />}
          href={generateRoutePath("shipments")}
        />
        {showBackToPickingButton && (
          <Button
            as="a"
            basic
            icon="box"
            id="close"
            content={<Trans i18nKey="shipment.toPicking" />}
            href={generateRoutePath("packShipment", { _id: shipmentId })}
          />
        )}

        {canCancelShipment && (
          <Button
            basic
            icon="trash"
            content={<Trans i18nKey="shipment.form.cancel" />}
            onClick={() => setConfirmState({ show: true, action: "cancel" })}
            data-test="ShipmentCancelBtn"
          />
        )}
        {/* admins can uncancel a shipment*/}
        {canUnCancelShipment && (
          <Button
            icon="undo"
            content={<Trans i18nKey="shipment.form.backToDraft" />}
            onClick={() => setConfirmState({ show: true, action: "toDraft" })}
            data-test="ShipmentBackToDraftBtn"
          />
        )}
        <ConfirmComponent
          show={confirmState.show}
          showConfirm={showConfirm}
          onConfirm={onConfirm}
        />
      </div>
    </Segment>
  );
};
export default ShipmentFooter;
