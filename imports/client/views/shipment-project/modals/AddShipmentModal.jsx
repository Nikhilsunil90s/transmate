import { toast } from "react-toastify";
import { useQuery, useMutation } from "@apollo/client";
import escapeRegExp from "lodash.escaperegexp";
import gql from "graphql-tag";
import React, { useState } from "react";
import { Button, Grid, Modal } from "semantic-ui-react";
import { AutoForm } from "uniforms-semantic";
import client from "../../../services/apollo/client";
import existingShipmentSchema from "../schema/exisitngShipment.schema";
import SelectField from "/imports/client/components/forms/uniforms/SelectField";
import Loader from "/imports/client/components/utilities/Loader.jsx";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("project:UI");

const rootEl = document.getElementById("react-root");

const GET_AVAILABLE_SHIPMENTS = gql`
  query getAvailableShipments($type: String) {
    availableShipments: getAvailableShipments(type: $type) {
      id
      number
      shipperReference
      projectTitle
      status
    }
  }
`;

const ADD_EXISTING_SHIPMENT_TO_PROJECT = gql`
  mutation addExistingShipmentToProject($input: AddExistingShipmentToProjectType!) {
    addExistingShipmentToProject(input: $input)
  }
`;

let formRef;

const AvailableShipmentsField = ({ availableShipments }) => {
  const prepareOptions = options =>
    options.map(s => ({
      key: s.id,
      value: s.id,
      text: (
        <>
          {s.number}{" "}
          <span style={{ opacity: 0.5 }}>
            {s.shipperReference} ({s.projectTitle})
          </span>{" "}
        </>
      )
    }));
  const handleSearch = (options, query) => {
    const opts = availableShipments.filter(({ number, shipperReference, projectTitle }) => {
      const re = new RegExp(escapeRegExp(query), "gi");

      const isMatchNumber = re.test(number);
      const isMatchRef = re.test(shipperReference);
      const isMatchProject = re.test(projectTitle);

      return isMatchNumber || isMatchRef || isMatchProject;
    });
    debug("options %o", opts);
    return prepareOptions(opts);
  };
  return (
    <SelectField
      name="shipmentId"
      options={prepareOptions(availableShipments)}
      search={handleSearch}
    />
  );
};

const AvailableShipmentsForm = ({ availableShipments, handleSubmit, addNewShipment }) => {
  return (
    <AutoForm
      schema={existingShipmentSchema}
      onSubmit={handleSubmit}
      ref={ref => {
        formRef = ref;
      }}
    >
      <Grid>
        <Grid.Row>
          <Grid.Column width={8}>
            <h3>New Shipment</h3>
            <Button primary onClick={() => addNewShipment()}>
              New
            </Button>
          </Grid.Column>
          <Grid.Column width={8}>
            <h3>Existing</h3>
            <AvailableShipmentsField {...{ availableShipments }} />
            <Button primary onClick={() => formRef.submit()}>
              Save
            </Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </AutoForm>
  );
};

const AddShipmentModal = ({ type, canEdit }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const { goRoute, params } = useRoute();

  const [addExistingShipmentToProject] = useMutation(ADD_EXISTING_SHIPMENT_TO_PROJECT, { client });
  const { data = {}, loading } = useQuery(GET_AVAILABLE_SHIPMENTS, {
    client,
    variables: { type },
    fetchPolicy: "no-cache"
  });
  const projectId = params._id;

  const { availableShipments = [] } = data;

  const addNewShipment = () => {
    goRoute("newShipmentFromProject", { type: type.toLowerCase(), projectId });
  };

  const handleSubmit = ({ shipmentId }) => {
    if (!shipmentId) {
      return;
    }
    debug("adding new shipment %s, type: %s", shipmentId, type);
    addExistingShipmentToProject({
      variables: {
        input: {
          shipmentId,
          projectId,
          type
        }
      }
    })
      .then(() => toast.success("Successfully added shipment"))
      .catch(err => console.error(err))
      .finally(() => setModalOpen(false));
  };

  return (
    <Modal
      disabled={!canEdit}
      open={isModalOpen}
      onClose={() => setModalOpen(false)}
      trigger={
        <Button primary disabled={!canEdit} onClick={() => setModalOpen(true)}>
          Add new
        </Button>
      }
      size="small"
      mountNode={rootEl}
    >
      <Modal.Header>Add shipment</Modal.Header>

      <Modal.Content>
        {loading ? (
          <Loader loading />
        ) : (
          <AvailableShipmentsForm {...{ availableShipments, addNewShipment, handleSubmit }} />
        )}
      </Modal.Content>

      <Modal.Actions>
        <Button onClick={() => setModalOpen(false)}>Cancel</Button>
      </Modal.Actions>
    </Modal>
  );
};

export default AddShipmentModal;
