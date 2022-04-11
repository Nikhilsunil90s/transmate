import React from "react";
import { Random } from "/imports/utils/functions/random.js";
import { Button } from "semantic-ui-react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import { VolumeGroupForm } from "./modals/VolumeGroup.jsx";
import VolumeOverview from "./Volumes.jsx";

import { scopeData } from "./.storydata.js";

export default {
  title: "Components/Scope/VolumeGroup"
};

const dummyProps = {
  onSubmitForm: data => console.log(data)
};

// as part of a uniforms:
export const blank = () => {
  let formRef = null;
  const { ...props } = dummyProps;

  return (
    <PageHolder main="PriceList">
      <VolumeGroupForm
        {...props}
        formRef={ref => {
          formRef = ref;
        }}
      />
      <Button onClick={() => formRef.submit()} content="submit" />
    </PageHolder>
  );
};

export const edit = () => {
  let formRef = null;
  const { ...props } = dummyProps;
  props.data = {
    id: Random.id(),
    uom: "pal",
    ranges: [{ id: Random.id(), from: 0, to: 10, name: "0 - 10 pal" }]
  };

  return (
    <PageHolder main="PriceList">
      <VolumeGroupForm
        {...props}
        formRef={ref => {
          formRef = ref;
        }}
      />
      <Button onClick={() => formRef.submit()} content="submit" />
    </PageHolder>
  );
};

export const disabled = () => {
  let formRef = null;
  const { ...props } = dummyProps;
  props.data = {
    id: Random.id(),
    uom: "pal",
    ranges: [{ id: Random.id(), from: 0, to: 10, name: "0 - 10 pal" }]
  };
  props.isLocked = true;

  return (
    <PageHolder main="PriceList">
      <VolumeGroupForm
        {...props}
        formRef={ref => {
          formRef = ref;
        }}
      />
      <Button onClick={() => formRef.submit()} content="submit" />
    </PageHolder>
  );
};

export const overview = () => {
  const props = {
    volumes: scopeData.volumes,
    onSave: (update, cb) => {
      console.log(update);
      if (cb) cb();
    },
    canEdit: true
  };

  return <VolumeOverview {...props} />;
};
