import React, { useContext } from "react";
import { Trans } from "react-i18next";
import { useQuery } from "@apollo/client";

import CostTable from "/imports/client/views/shipment/sections/costs/table/CostTable.jsx";
import { ModalComponent, ModalActionsClose } from "/imports/client/components/modals";
import { GET_SHIPMENT_COST_DETAIL } from "/imports/client/views/invoice/utils/queries";
import { initSecurity } from "./initSecurity";
import LoginContext from "/imports/client/context/loginContext";

const debug = require("debug")("invoice:datadetail");

const DataDetailModal = ({ show, showModal, title, ...props }) => {
  const context = useContext(LoginContext);
  const { shipmentId, invoiceId } = props;

  debug("DataDetailModal %o", { shipmentId, invoiceId });

  const { data = {}, error } = useQuery(GET_SHIPMENT_COST_DETAIL, {
    variables: { shipmentId, invoiceId },
    fetchPolicy: "no-cache",
    skip: !shipmentId && !invoiceId
  });
  if (error) console.error(error);
  if (!shipmentId && !invoiceId) return null;
  debug("data %o", data);
  const { costDetail, ...shipment } = data.costDetails || {};
  const costSecurity = initSecurity({ shipment, context });

  return (
    <ModalComponent
      show={show}
      title={<Trans i18nKey="partner.billing.invoice.details.title" />}
      body={<CostTable costData={costDetail} security={costSecurity} />}
      actions={<ModalActionsClose {...{ showModal }} />}
    />
  );
};

export default DataDetailModal;
