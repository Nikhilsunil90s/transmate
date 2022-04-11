import { toast } from "react-toastify";
import React, { useState } from "react";
import { useApolloClient } from "@apollo/client";
import { Trans } from "react-i18next";

import { Popup, Button } from "semantic-ui-react";
import initializeConfirm from "/imports/client/components/modals/confirm";

import { MASS_ACTION } from "./queries";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("shipment:overview-menu");

const ICON = {
  delete: "trash",
  archive: "archive",
  copy: "copy"
};

const MassAction = ({ getSelectedShipments, action }) => {
  const client = useApolloClient();
  const { showConfirm, Confirm } = initializeConfirm();
  const [isMassActionLoading, setMassActionLoading] = useState(false);
  const [selected, setSelected] = useState([]);

  const { goRoute } = useRoute();

  function triggerConfirm() {
    const shipments = getSelectedShipments();
    const shipmentIds = shipments.map(({ shipmentId }) => shipmentId);
    setSelected(shipmentIds);
    showConfirm(true);
  }

  function onConfirm() {
    const shipmentIds = selected;

    setMassActionLoading(true);
    client
      .mutate({
        mutation: MASS_ACTION,
        variables: { input: { action, shipmentIds } }
      })
      .then(({ data = {} }) => {
        const { success, errors, newIds } = data.response || {};
        debug("mass action result: %o", { success, errors, newIds });
        setMassActionLoading(false);

        toast.info(
          <Trans
            i18nKey={`shipment.mass.${action}.successMsg`}
            success={success?.length || 0}
            errors={errors?.length || 0}
          />
        );

        if (action === "copy" && newIds?.length) {
          goRoute("shipment", { _id: newIds[0] });
        }
        showConfirm(false);
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not run massAction");
      });
  }
  return (
    <>
      <Popup
        header={<Trans i18nKey={`shipment.mass.${action}.tooltip`} />}
        content={<Trans i18nKey={`shipment.mass.${action}.tooltipText`} />}
        trigger={
          <Button
            basic
            icon={ICON[action]}
            loading={isMassActionLoading}
            onClick={triggerConfirm}
          />
        }
      />
      <Confirm
        onConfirm={onConfirm}
        content={<Trans i18nKey={`shipment.mass.${action}.confirm`} count={selected.length} />}
      />
    </>
  );
};

export default MassAction;
