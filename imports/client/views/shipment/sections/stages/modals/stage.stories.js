/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import faker from "faker";
import { Button } from "semantic-ui-react";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import { cloneDeep } from "lodash";
import DriverAllocationModal, { DriverAllocationForm } from "./Driver";
import StageSplitModal from "./StageSplit";
import StageConfirmModal, {
  ConfirmForm as StageConfirmFormComponent
} from "./StageConfirm";

import { dummyProps } from "../storyData";

export default {
  title: "Shipment/Segments/stages/components"
};

export const selectDriver = () => {
  const props = { ...dummyProps };
  return (
    <PageHolder main="Shipment">
      <DriverAllocationForm {...props} />
    </PageHolder>
  );
};

export const selectDriverModal = () => {
  const [show, showModal] = useState(false);
  const props = { ...dummyProps };
  return (
    <PageHolder main="Shipment">
      <DriverAllocationModal {...props} {...{ show, showModal }} />
      <Button content="triggerModal" onClick={() => showModal(true)} />
    </PageHolder>
  );
};

export const selectDriverModalExisting = () => {
  const [show, showModal] = useState(false);
  const props = { ...dummyProps };
  props.stage.driverId = "testID";
  props.stage.instructions = faker.lorem.sentence();
  props.stage.plate = "test plate";
  return (
    <PageHolder main="Shipment">
      <DriverAllocationModal {...props} {...{ show, showModal }} />
      <Button content="triggerModal" onClick={() => showModal(true)} />
    </PageHolder>
  );
};

export const stageSplitModal = () => {
  const [show, showModal] = useState(false);
  const props = { ...dummyProps };

  return (
    <PageHolder main="Shipment">
      <StageSplitModal {...props} {...{ show, showModal }} />
      <Button content="triggerModal" onClick={() => showModal(true)} />
    </PageHolder>
  );
};

export const StageConfirm = () => {
  const [show, showModal] = useState(false);
  const props = { ...dummyProps };

  return (
    <PageHolder main="Shipment">
      <StageConfirmModal {...props} {...{ show, showModal }} />
      <Button content="triggerModal" onClick={() => showModal(true)} />
    </PageHolder>
  );
};

export const StageConfirmFormSimple = () => {
  return (
    <StageConfirmFormComponent
      stage={dummyProps.stage}
      onSubmitForm={console.log}
    />
  );
};

export const StageConfirmFormWithTimeZone = () => {
  const stage = cloneDeep(dummyProps.stage);
  stage.to.timeZone = "America/Sao_Paulo";
  return <StageConfirmFormComponent stage={stage} onSubmitForm={console.log} />;
};
