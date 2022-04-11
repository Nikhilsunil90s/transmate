import React from "react";
import { Trans } from "react-i18next";
import { Button } from "semantic-ui-react";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { CREATE_SHIPMENT_IMPORT } from "../utils/queries";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("shipment:overview-all");

const Footer = () => {
  const { goRoute } = useRoute();
  const [createImport, { loading }] = useMutation(CREATE_SHIPMENT_IMPORT, {
    onCompleted(data = {}) {
      debug("create import response %o", data);
      if (!data.createShipmentImport?.id) return toast.error("No id returned");
      return goRoute("import", { _id: data.createShipmentImport.id });
    },
    onError(error) {
      console.error(error);
      toast.error("Could not start import");
    }
  });

  return (
    <>
      <Button
        onClick={() => goRoute("newShipment")}
        primary
        icon="circle add"
        content={<Trans i18nKey="dashboard.add.shipment" />}
      />
      <Button
        basic
        onClick={() => goRoute("shipmentRequest")}
        primary
        icon="circle add"
        content={<Trans i18nKey="dashboard.add.request" />}
      />
      <Button
        primary
        basic
        loading={loading}
        onClick={createImport}
        content={<Trans i18nKey="dashboard.add.import" />}
        data-test="importBtn"
      />
    </>
  );
};

export default Footer;
