import { useMutation } from "@apollo/client";
import React from "react";
import { NewShipmentForm } from "/imports/client/views/shipment-new/components/ShipmentForm";
import { SAVE_LANE } from "../utils/queries";

const LaneSection = ({ onSave }) => {
  const [saveLane, { loading }] = useMutation(SAVE_LANE, {
    onError(err) {
      console.error(err);
    }
  });
  const onSubmitForm = formData => {
    const post = {};
    ["pickup", "delivery"].forEach(dir => {
      post[dir] = {
        location: formData[`${dir}Location`],
        date: formData[`${dir}Date`]
      };
    });

    const { pickup, delivery } = post;
    saveLane({ variables: { input: { pickup, delivery } } }).then(data => {
      onSave({ shipmentId: data.id });
    });
  };

  return <NewShipmentForm onSubmitForm={onSubmitForm} loading={loading} />;
};

export default LaneSection;
