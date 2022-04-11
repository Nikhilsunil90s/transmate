import { useApolloClient, useQuery } from "@apollo/client";

import React, { useContext, useEffect } from "react";
import { Container } from "semantic-ui-react";
import Footer from "./components/Footer";
import Loader from "/imports/client/components/utilities/Loader.jsx";
import {
  AccessDeniedSection,
  AlertsSection,
  CostsSection,
  BillingSection,
  DocumentSection,
  HistorySection,
  ItemSection,
  LinksSection,
  MapSection,
  NonConformanceSection,
  NotesSection,
  PartnerSection,
  ReferenceSection,
  StagesSection,
  TagSection
} from "./sections";

import {
  GET_SHIPMENT

  // UPDATE_SHIPMENT
} from "./utils/queries";
import { initializeSecurity } from "./utils/security";
import { removeEmpty } from "/imports/utils/functions/fnRemoveNullFromObject";

import LoginContext from "/imports/client/context/loginContext";
import useRoute from "../../router/useRoute";
import { markNotificationsRead } from "/imports/utils/UI/markNotificationsRead";

const debug = require("debug")("shipment:view");

const ShipmentPageBody = ({ ...props }) => {
  // const { userId, accountId } = useContext(LoginContext);
  // const creationUserId = get(props, "shipment.created.by");
  // debug(
  //   "running shipment for userid %s of account, created by %s",
  //   userId,
  //   accountId,
  //   creationUserId
  // );

  return (
    <>
      <MapSection {...props} />

      <Container fluid className="shipment">
        <AlertsSection {...props} />
        <LinksSection {...props} />
        <StagesSection {...props} />
        <ItemSection {...props} />
        <CostsSection {...props} />
        <BillingSection {...props} />
        <ReferenceSection {...props} />
        <NotesSection {...props} />
        <DocumentSection {...props} />
        <NonConformanceSection {...props} />
        <PartnerSection {...props} />
        <HistorySection {...props} />

        <TagSection {...props} />
      </Container>
    </>
  );
};

export const ShipmentPage = ({ ...props }) => {
  const {
    security: { isVisible }
  } = props;
  return (
    <>
      <div>{isVisible ? <ShipmentPageBody {...props} /> : <AccessDeniedSection />}</div>
      <Footer {...props} />
    </>
  );
};
const ShipmentPageLoader = () => {
  const client = useApolloClient();
  const { params } = useRoute();
  const shipmentId = params._id;
  const context = useContext(LoginContext);

  useEffect(() => {
    markNotificationsRead(
      "shipment",
      ["received", "canceled", "delayed", "note", "reference"],
      { shipmentId },
      client
    );
  }, [shipmentId]);

  const { data: fetchData = {}, loading, error, refetch } = useQuery(GET_SHIPMENT, {
    variables: { shipmentId },
    skip: !shipmentId
  });
  debug("shipment data from apollo", { fetchData, loading, error });
  if (error) console.error(error);

  const shipment = removeEmpty(fetchData.shipment || {}, true);

  const security = initializeSecurity({ shipment, context });
  debug("shipment security %o", security);
  const props = { shipmentId, shipment, security, refetch };
  if (loading) {
    // debugger;
    return <Loader loading />;
  }

  return <ShipmentPage {...props} />;
};

export default ShipmentPageLoader;
