import { useQuery } from "@apollo/client";
import get from "lodash.get";
import React, { useMemo, useState } from "react";
import { Container, Step } from "semantic-ui-react";

import { GET_SHIPMENT } from "./utils/queries";

import ShipmentForm from "../shipment-new/components/ShipmentForm";
import ShipmentItems from "./components/ShipmentItems";
import ShipmentReferences from "./components/ShipmentReferences";
import Success from "./components/Success";

interface StepItemType {
  key: string;
  icon: string;
  title: string;
  description: string;
}

export const ShipmentRequest = ({
  shipmentId,
  afterCreateShipment,
  shipment
}) => {
  const [activeStep, setActiveStep] = useState<string>("shipment");

  const steps = [
    {
      key: "shipment",
      icon: "map",
      title: "Shipment",
      description: "Choose your Shipment Item"
    },
    {
      key: "item-overview",
      icon: "box",
      title: "Item Overview",
      description: "Item Overview"
    },
    {
      key: "references",
      icon: "clipboard check",
      title: "References",
      description: "Shipment information"
    }
  ];

  const stepItems = useMemo(() => {
    return steps.map((item: StepItemType) => ({
      ...item,
      onClick: () => setActiveStep(item.key),
      disabled: !shipmentId && item.key !== "shipment",
      checked: (function setChecked() {
        if (item.key === "shipment" && !!shipmentId) return true;
        if (
          item.key === "item-overview" &&
          get(shipment, ["nestedItems", "length"])
        )
          return true;
        return false;
      })(),
      active: item.key === activeStep
    }));
  }, [activeStep, shipmentId]);

  const afterCreateCallback = (newShipmentId: string) => {
    setActiveStep("item-overview");
    afterCreateShipment(newShipmentId);
  };

  const isSubmittedRequest = shipment?.request?.status === "submitted";

  return (
    <div>
      {isSubmittedRequest ? (
        <Container fluid>
          <Success shipmentId={shipmentId} shipment={shipment} />
        </Container>
      ) : (
        <>
          <Step.Group items={stepItems} />
          <Container fluid>
            {activeStep === "shipment" && (
              <ShipmentForm
                isRequest
                afterCreateCallback={afterCreateCallback}
                shipment={shipment}
                disabled={!!shipment}
              />
            )}
            {activeStep === "item-overview" && (
              <ShipmentItems shipmentId={shipmentId} shipment={shipment} />
            )}
            {activeStep === "references" && (
              <ShipmentReferences shipmentId={shipmentId} shipment={shipment} />
            )}
          </Container>
        </>
      )}
    </div>
  );
};

const ShipmentRequestLoader = () => {
  const [shipmentId, setShipmentId] = useState<string>(null);

  const { data, refetch } = useQuery(GET_SHIPMENT, {
    variables: { shipmentId },
    skip: !shipmentId
  });

  const shipment = data?.shipment;

  const afterCreateShipment = (newShipmentId: string) => {
    setShipmentId(newShipmentId);
    refetch({ shipmentId: newShipmentId });
  };

  return (
    <ShipmentRequest
      shipmentId={shipmentId}
      afterCreateShipment={afterCreateShipment}
      shipment={shipment}
    />
  );
};

export default ShipmentRequestLoader;
