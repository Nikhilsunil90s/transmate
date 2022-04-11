import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import Stage from "./Stage.jsx";

import { dummyProps } from "./storyData";

export default {
  title: "Shipment/Segments/stages"
};

export const basic = () => {
  const props = { ...dummyProps };

  props.security = {
    canChangeAddress: true,
    canAssignDriver: false,
    canChangeMode: true,
    canChangeCarrier: true,
    canModifyPlannedDates: true
  };
  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="Shipment">
        <div className="stages">
          <Stage {...props} />
        </div>
      </PageHolder>
    </MockedProvider>
  );
};

export const disabled = () => {
  const props = { ...dummyProps };

  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="Shipment">
        <div className="stages">
          <Stage {...props} />
        </div>
      </PageHolder>
    </MockedProvider>
  );
};

export const canSplit = () => {
  const props = { ...dummyProps };
  props.security.canSplitStage = true;

  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="Shipment">
        <div className="stages">
          <Stage {...props} />
        </div>
      </PageHolder>
    </MockedProvider>
  );
};

export const releaseFieldIssue = () => {
  const props = { ...dummyProps };
  props.stage.isReadyForRelease = topic => topic !== "fields";

  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="Shipment">
        <div className="stages">
          <Stage {...props} />
        </div>
      </PageHolder>
    </MockedProvider>
  );
};

export const releaseItemsIssue = () => {
  const props = { ...dummyProps };
  props.stage.isReadyForRelease = topic => topic !== "items";

  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="Shipment">
        <div className="stages">
          <Stage {...props} />
        </div>
      </PageHolder>
    </MockedProvider>
  );
};

export const canRelease = () => {
  const props = { ...dummyProps };
  props.security.canSplitStage = true;
  props.security.canRelease = true;
  props.security.stageReadyForRelease = true;
  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="Shipment">
        <div className="stages">
          <Stage {...props} />
        </div>
      </PageHolder>
    </MockedProvider>
  );
};

export const canPutBackToDraft = () => {
  const props = { ...dummyProps };
  props.stage.status = "planned";
  props.security.canPutBackToDraft = true;
  props.security.canSplitStage = false;
  props.security.canRelease = false;
  props.security.stageReadyForRelease = false;

  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="Shipment">
        <div className="stages">
          <Stage {...props} />
        </div>
      </PageHolder>
    </MockedProvider>
  );
};

export const canMerge = () => {
  const props = { ...dummyProps };
  props.security.canMergeStage = true;

  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="Shipment">
        <div className="stages">
          <Stage {...props} />
        </div>
      </PageHolder>
    </MockedProvider>
  );
};
