/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect, useContext } from "react";
import { ApolloProvider, useLazyQuery, useMutation } from "@apollo/client";
import get from "lodash.get";

import OverviewPanelWrapper from "/imports/client/components/tables/components/OverviewPanelWrapper.jsx";
import ShipmentsTable from "./components/ShipmentsTable";
import ShipmentPlaceholder from "./components/ShipmentPlaceholder";
import { DEFAULT_VIEW, VIEWS } from "/imports/api/shipmentPicking/enums/views";
import { GET_PICKING_OVERVIEW, GET_PICKING_DETAIL, CANCEL_PACKING_LABEL } from "../utils/queries";
import LocationHeader from "./components/LocationHeader";
import LoginContext from "/imports/client/context/loginContext";
import { ConfirmComponent } from "/imports/client/components/modals";
import AddressModal from "/imports/client/components/modals/specific/AddressSelect";
import { printPage } from "../utils/printPage";
import ShipmentPicking from "../detail/components/ShipmentPicking";
import client from "/imports/client/services/apollo/client"; // root -> required
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("picking-overview:UI");

const ShipmentOverview = () => {
  const { queryParams, setQueryParams } = useRoute();
  const { user } = useContext(LoginContext);
  const userPreference = get(user, ["preferences", "picking", "addressId"], null);
  const [addressId, setAddressId] = useState(userPreference);
  const [currentViewKey, setViewState] = useState(queryParams.viewKey || DEFAULT_VIEW);
  const [show, showModal] = useState(false);
  const [confirmState, setConfirmState] = useState({ show: false });

  const showConfirm = showConfirmState =>
    setConfirmState({ ...confirmState, show: showConfirmState });

  const setView = viewKey => {
    setViewState(viewKey);
    setQueryParams({ viewKey });
  };

  const [
    fetchShipmentsLazy,
    { data: { pickingOverviewData = [] } = {}, refetch, loading, error }
  ] = useLazyQuery(GET_PICKING_OVERVIEW, {
    fetchPolicy: "cache-and-network"
  });

  const [fetchShipmentDetail] = useLazyQuery(GET_PICKING_DETAIL, {
    fetchPolicy: "no-cache",
    onCompleted: response => {
      const { shipment = {}, shipment: { id, nestedItems = [] } = {} } = response;

      printPage(
        <ApolloProvider client={client}>
          <ShipmentPicking
            shipmentId={id}
            data={{ shipment }}
            shipmentItems={nestedItems}
            withButtons={false}
          />
        </ApolloProvider>
      );
    }
  });

  debug("apollo data for addressId:%s, %o", addressId, { pickingOverviewData, error, loading });

  const [cancelPackingLabel] = useMutation(CANCEL_PACKING_LABEL, {
    onCompleted: () => {
      showConfirm(false);
      refetch();
    }
  });

  useEffect(() => {
    if (addressId) {
      fetchShipmentsLazy({
        variables: {
          input: { addressId, viewKey: currentViewKey }
        }
      });
    }
  }, [addressId, currentViewKey]);

  const onCancel = shipmentId => {
    setConfirmState({ show: true, shipmentId });
  };

  const confirmCancel = () => {
    const { shipmentId } = confirmState;

    cancelPackingLabel({
      variables: { shipmentId }
    });
  };

  const onPrint = shipmentId => {
    fetchShipmentDetail({
      variables: { shipmentId },
      skip: !shipmentId
    });
  };

  const onSubmitAddress = ({ location = {} }) => {
    debug("selected location %o", location);
    showModal(false);
    setAddressId(location.id);
  };

  const setDefaultView = () => setView(DEFAULT_VIEW);

  return (
    <>
      {!addressId ? (
        <ShipmentPlaceholder showModal={showModal} />
      ) : (
        <OverviewPanelWrapper
          overviewName="picking.overview"
          currentViewLabel={VIEWS[currentViewKey].text}
          setView={setView}
          setDefaultView={setDefaultView}
          views={VIEWS}
          locationTag={<LocationHeader addressId={addressId} showModal={showModal} />}
        >
          <ShipmentsTable
            items={pickingOverviewData}
            onCancel={onCancel}
            onPrint={onPrint}
            isLoading={loading}
            hasAddressId={Boolean(addressId)}
            currentViewKey={currentViewKey}
          />
        </OverviewPanelWrapper>
      )}

      <AddressModal show={show} showModal={showModal} onSubmitForm={onSubmitAddress} />

      <ConfirmComponent
        show={confirmState.show}
        showConfirm={showConfirm}
        onConfirm={confirmCancel}
      />
    </>
  );
};

export default ShipmentOverview;
