import { toast } from "react-toastify";
import { Trans } from "react-i18next";
import { useMutation, useQuery } from "@apollo/client";
import React, { useContext, useState } from "react";
import { Button, Grid, Modal } from "semantic-ui-react";
import { AutoField, AutoForm } from "uniforms-semantic";

import createShipmentSchema from "../utils/createShipment.schema";

import { SelectField } from "../../../components/forms/uniforms";

import { CREATE_SHIPMENT_PROJECT, GET_ACCOUNT_SETTINGS } from "../utils/queries";
import useRoute from "/imports/client/router/useRoute";
import LoginContext from "/imports/client/context/loginContext";

const debug = require("debug")("projects");

const rootEl = document.getElementById("react-root");
const EDIT_PROJECT_FEATURE = "shipmentProjectsEdit";

let formRef;
const CreateShipmentProjectModal = () => {
  const { account } = useContext(LoginContext);
  const hasFeature = (account?.features || []).includes(EDIT_PROJECT_FEATURE);
  const { goRoute } = useRoute();

  const [isModalOpen, setModalOpen] = useState(false);
  const [createShipmentProject] = useMutation(CREATE_SHIPMENT_PROJECT);

  const { data = {}, loading, error } = useQuery(GET_ACCOUNT_SETTINGS);

  const { projectCodes = [], projectYears = [] } = data.accountSettings || {};
  const projectCodeOptions = projectCodes.map(({ group, code }) => ({
    value: code,
    text: `${group} - ${code}`
  }));
  const defaultProjectYear =
    (Array.isArray(projectYears) && projectYears[projectYears.length - 1]) || null;

  const handleSubmitShipmentProject = ({ year, type, title }) => {
    const projectCode = projectCodes.find(p => p.code === type);
    createShipmentProject({
      variables: {
        input: {
          year,
          type: {
            code: projectCode.code,
            group: projectCode.group,
            name: projectCode.name
          },
          title
        }
      }
    })
      // eslint-disable-next-line no-shadow
      .then(({ data = {}, error, errors }) => {
        debug("after save project %o", data);
        const projectId = data.createShipmentProject?.id;
        if (error || errors) throw error || errors;
        if (!projectId) throw new Error("No projectId");
        toast.success("Successfully created shipment project");

        goRoute("project", { _id: projectId });
      })
      .catch(error => {
        console.error({ error });
        toast.error("Error creating shipment project");
      })
      .finally(() => setModalOpen(false));
  };

  if (!hasFeature) return null;

  return (
    <Modal
      open={isModalOpen}
      onClose={() => setModalOpen(false)}
      trigger={<Button primary icon="add" onClick={() => setModalOpen(true)} content="Create" />}
      size="small"
      mountNode={rootEl}
    >
      <Modal.Header>Create new project</Modal.Header>

      <Modal.Content>
        <AutoForm
          schema={createShipmentSchema}
          onSubmit={handleSubmitShipmentProject}
          ref={ref => {
            formRef = ref;
          }}
        >
          <Grid>
            <Grid.Row>
              <Grid.Column width={9}>
                <SelectField name="type" search options={projectCodeOptions} loading={loading} />
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width={6}>
                <AutoField name="title" />
              </Grid.Column>

              <Grid.Column width={6}>
                <SelectField
                  name="year"
                  allowedValues={projectYears}
                  defaultValue={defaultProjectYear}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </AutoForm>
      </Modal.Content>

      <Modal.Actions>
        <Button onClick={() => setModalOpen(false)} content={<Trans i18nKey="form.cancel" />} />
        <Button
          disabled={!!error}
          primary
          onClick={() => formRef.submit()}
          content={<Trans i18nKey="form.save" />}
        />
      </Modal.Actions>
    </Modal>
  );
};

export default CreateShipmentProjectModal;
