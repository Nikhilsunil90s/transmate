import React, { useState } from "react";
import { Random } from "/imports/utils/functions/random.js";
import classnames from "classnames";
import cloneDeep from "lodash/cloneDeep";
import { connectField, filterDOMProps } from "uniforms";
import { Modal, Button } from "semantic-ui-react";
import { AutoField, AutoForm } from "uniforms-semantic";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

const rootEl = document.getElementById("react-root");

let formRef;
const NewChargeModal = ({ isModalOpen, setModalOpen, onAddCharge }) => {
  const handleFormSubmit = ({ name }) => {
    onAddCharge(name);
    setModalOpen(false);
  };
  return (
    <Modal open={isModalOpen} size="small" mountNode={rootEl}>
      <Modal.Header>New charge line</Modal.Header>

      <Modal.Content>
        <AutoForm
          schema={new SimpleSchema2Bridge(new SimpleSchema({ name: String }))}
          onSubmit={handleFormSubmit}
          ref={ref => {
            formRef = ref;
          }}
        >
          <AutoField name="name" />
        </AutoForm>
      </Modal.Content>

      <Modal.Actions>
        <Button onClick={() => setModalOpen(false)}>Cancel</Button>
        <Button primary onClick={() => formRef.submit()}>
          Save
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

const ListAdd = ({ className, disabled, parent, value, ...props }) => {
  const limitNotReached = !disabled && !(parent.maxCount <= parent.value.length);

  const [isModalOpen, setModalOpen] = useState(false);

  function onClickHandler() {
    setModalOpen(true);
  }

  const onAddCharge = name => {
    if (limitNotReached) {
      parent.onChange(parent.value.concat([cloneDeep({ id: Random.id(6), name, isAdded: true })]));
    }
  };

  return (
    <>
      <i
        {...filterDOMProps(props)}
        className={classnames(
          "ui",
          className,
          limitNotReached ? "link" : "disabled",
          "fitted add icon"
        )}
        onClick={onClickHandler}
      />
      <NewChargeModal {...{ isModalOpen, setModalOpen, onAddCharge }} />
    </>
  );
};

export default connectField(ListAdd, {
  includeParent: true,
  initialValue: false
});
