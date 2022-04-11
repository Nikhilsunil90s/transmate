import React from "react";
import { toast } from "react-toastify";
import { useApolloClient, useQuery } from "@apollo/client";
import pick from "lodash.pick";
import { Trans, useTranslation } from "react-i18next";

import { Form, Button } from "semantic-ui-react";
import { AutoForm, AutoField, TextField } from "uniforms-semantic";
import SelectField from "/imports/client/components/forms/uniforms/SelectField";
import { StageAllocationSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/stageAllocationSchema";
import { ModalComponent } from "/imports/client/components/modals/Modal";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

import { ALLOCATE_STAGE_TO_DRIVER, GET_USERS_FOR_DRIVER_SELECTION } from "../utils/queries";

const debug = require("debug")("shipment:stage");

let formRef;
export const DriverAllocationForm = ({ stage, onSubmitForm }) => {
  const { t } = useTranslation();
  const model = pick(stage, "plate", "driverId", "instructions");

  const { data = {}, loading, errors } = useQuery(GET_USERS_FOR_DRIVER_SELECTION, {
    variables: { roles: ["driver"] }
  });
  debug("apollo data for driver selection %o", { data, loading, errors });

  const users = data.users || [];

  return (
    <AutoForm
      schema={new SimpleSchema2Bridge(StageAllocationSchema)}
      model={model}
      onSubmit={onSubmitForm}
      ref={ref => {
        formRef = ref;
      }}
    >
      <Form.Group widths="equal">
        <AutoField name="plate" label={t("shipment.form.driver.plate")} />
        <SelectField
          name="driverId"
          label={t("shipment.form.driver.driver")}
          options={users.map(({ id, name }) => ({ key: id, value: id, text: name }))}
          loading={loading}
        />
      </Form.Group>

      <TextField name="instructions" />
    </AutoForm>
  );
};

const DriverAllocationModal = ({ ...props }) => {
  const client = useApolloClient();
  const { show, showModal, stage } = props;

  function saveAllocation(allocation) {
    client
      .mutate({
        mutation: ALLOCATE_STAGE_TO_DRIVER,
        variables: {
          input: {
            stageId: stage.id,
            allocation
          }
        }
      })
      .then(({ errors }) => {
        if (errors) throw errors;
        toast.success("Changes saved");
        showModal(false);
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not save changes");
      });
  }

  function deleteDriver() {
    saveAllocation();
  }
  function allocateDriver(allocation) {
    saveAllocation(allocation);
  }

  return (
    <ModalComponent
      title={<Trans i18nKey="shipment.form.driver.title" />}
      show={show}
      showModal={showModal}
      body={<DriverAllocationForm {...props} onSubmitForm={allocateDriver} />}
      actions={
        <>
          {stage.driverId ? (
            <Button
              color="red"
              content={<Trans i18nKey="shipment.form.driver.clear" />}
              onClick={deleteDriver}
            />
          ) : (
            <Button onClick={() => showModal(false)}>
              <Trans i18nKey="form.cancel" />
            </Button>
          )}
          <Button
            primary
            content={<Trans i18nKey="shipment.form.driver.submit" />}
            onClick={() => formRef.submit()}
          />
        </>
      }
    />
  );
};

export default DriverAllocationModal;
