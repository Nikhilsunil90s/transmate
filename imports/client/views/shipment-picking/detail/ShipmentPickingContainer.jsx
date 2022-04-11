import React, { useState } from "react";
import { toast } from "react-toastify";
import { useQuery, useApolloClient } from "@apollo/client";
import isEmpty from "lodash.isempty";

import {
  GET_PICKING_DETAIL,
  PACK_SHIPMENT_ITEMS,
  CANCEL_PACKING_LABEL,
  UNPACK_PACKING_ITEMS
} from "../utils/queries";
import { DEFAULT_UNITS } from "/imports/api/_jsonSchemas/enums/shipmentItems";
import ShipmentPicking from "./components/ShipmentPicking";

import { mutate } from "/imports/utils/UI/mutate";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("picking:UI");

function generateDescription(items = []) {
  const descriptions = [...new Set(items.map(({ description }) => description))];
  return descriptions.length ? descriptions.join(", ") : "Parcel";
}

const ShipmentPickingContainer = ({ withButtons }) => {
  const client = useApolloClient();
  const { params } = useRoute();
  const shipmentId = params._id;
  const [shipmentItems, setShipmentItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const [confirmState, setConfirmState] = useState({ show: false });
  const [confirmCancelState, setConfirmCancelState] = useState({ show: false });

  const { data = {}, refetch, error, loading } = useQuery(GET_PICKING_DETAIL, {
    variables: { shipmentId },
    fetchPolicy: "cache-and-network",
    skip: !shipmentId,
    notifyOnNetworkStatusChange: true,
    onCompleted: response => {
      const { nestedItems } = response.shipment;

      setShipmentItems(nestedItems);
    }
  });

  debug("apollo data %o, %s", { data, error, loading }, shipmentId);

  const onCancelLabel = () => {
    const { packingItemIds } = confirmCancelState;
    mutate(
      {
        client,
        query: { mutation: CANCEL_PACKING_LABEL, variables: { packingItemIds } },
        errorMsg: "Could not cancel label"
      },
      ({ cancelPackingLabel }) => {
        const { nestedItems } = cancelPackingLabel;

        setShipmentItems(nestedItems);
        setConfirmCancelState({ show: false });
      }
    );
  };

  const onSubmit = (submitData, cb) => {
    const { parentItem, weight_unit: weightUnit, weight, dimensions = {}, code } = submitData;
    const newExistingItem = DEFAULT_UNITS.find(item => item.code === parentItem);
    const totalWeightNet = selectedItems
      .map(({ weight_net: weightNet }) => weightNet)
      .reduce((acc, n) => acc + n, 0);
    const totalWeightTare = selectedItems
      .map(({ weight_tare: weightTare = 0 }) => weightTare)
      .reduce((acc, n) => acc + n, 0);
    const parentItemData = {
      dimensions,

      weight_net: totalWeightNet,
      weight_tare: totalWeightTare,
      weight_gross: weight,
      weight_unit: weightUnit,

      code,
      description: generateDescription(selectedItems)
    };

    if (newExistingItem) {
      parentItemData.code = parentItem;
    } else parentItemData.id = parentItem;

    debug("saving packing unit: %o", {
      shipmentId,
      shipmentItemIds: selectedItems.map(({ id }) => id),
      parentItem: parentItemData
    });

    mutate(
      {
        client,
        query: {
          mutation: PACK_SHIPMENT_ITEMS,
          variables: {
            input: {
              shipmentId,
              shipmentItemIds: selectedItems.map(({ id }) => id),
              parentItem: parentItemData
            }
          }
        },
        errorMsg: "Could not pack items"
      },
      ({ packShipmentItems = {} }) => {
        const { shipment: { nestedItems = [] } = {} } = packShipmentItems;
        const { successCount = 0 } = packShipmentItems.result || {};

        debug("result packingoperation: %o", packShipmentItems);
        toast.info(`Packed ${successCount} items`);
        setShipmentItems(nestedItems);
        setSelectedItems([]);
        if (typeof cb === "function") cb();
      }
    );
  };

  const unpackItems = () => {
    const { packingUnitsIds } = confirmState;

    mutate(
      {
        client,
        query: {
          mutation: UNPACK_PACKING_ITEMS,
          variables: {
            packingUnitsIds
          }
        },
        errorMsg: "Could not unpack items"
      },
      ({ unpackShipmentItems }) => {
        const { shipment: { nestedItems = [] } = {} } = unpackShipmentItems;
        const { successCount = 0 } = unpackShipmentItems.result || {};

        debug("result packingoperation: %o", unpackShipmentItems);
        toast.info(`Unpacked ${successCount} items`);

        setShipmentItems(nestedItems);
        setConfirmState({ show: false });
      }
    );
  };

  if (loading) return "Loading...";
  if (isEmpty(data.shipment)) return "Not found";

  return (
    <ShipmentPicking
      shipmentId={shipmentId}
      data={data}
      refetch={refetch}
      shipmentItems={shipmentItems}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      onCancelLabel={onCancelLabel}
      onSubmit={onSubmit}
      unpackItems={unpackItems}
      confirmState={confirmState}
      setConfirmState={setConfirmState}
      confirmCancelState={confirmCancelState}
      setConfirmCancelState={setConfirmCancelState}
      withButtons={withButtons}
    />
  );
};

export default ShipmentPickingContainer;
