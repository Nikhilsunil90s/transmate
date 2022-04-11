/* eslint-disable react-hooks/rules-of-hooks */
import { Trans } from "react-i18next";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import React, { useState } from "react";
import { Button, Grid, Modal, Divider } from "semantic-ui-react";
import { AutoForm } from "uniforms-semantic";
import SelectField from "/imports/client/components/forms/uniforms/SelectField";

import existingPriceRequestSchema from "./existingPriceRequest.schema.js";
import useRoute from "/imports/client/router/useRoute.js";

const debug = require("debug")("shipment:overview-menu");

const rootEl = document.getElementById("react-root");

const GET_OPEN_PRICE_REQUESTS = gql`
  query getOpenPriceRequests {
    openPriceRequests: getOpenPriceRequests {
      id
      title
    }
  }
`;

const initializePriceRequestModal = ({ createOrModifyPriceRequest }) => {
  let formRef;

  const { goRoute } = useRoute();

  const [isModalOpen, setModalOpen] = useState(false);
  const [isMassPriceLoading, setMassPriceLoading] = useState(false);

  // const [addExisitingShipmentToProject] = useMutation(ADD_EXISTING_SHIPMENT_TO_PROJECT, { client });
  const { data = {} } = useQuery(GET_OPEN_PRICE_REQUESTS, {
    fetchPolicy: "no-cache"
  });

  const { openPriceRequests = [] } = data;
  const priceRequestOptions = openPriceRequests.map(({ id, title }) => ({
    value: id,
    text: title
  }));

  function closeCallback(priceRequestId) {
    debug("priceRequest.generate data: %o", priceRequestId);
    setMassPriceLoading(false);
    setModalOpen(false);
    if (priceRequestId) {
      goRoute("priceRequestEdit", { _id: priceRequestId });
    }
  }
  const handleSubmit = ({ priceRequestId }) => {
    if (!priceRequestId) {
      return;
    }
    setMassPriceLoading(true);
    createOrModifyPriceRequest({ priceRequestId }, closeCallback);
  };

  const handleNew = () => {
    setMassPriceLoading(true);
    createOrModifyPriceRequest({}, closeCallback);
  };

  return {
    setModalOpen,
    PriceRequestModal: () => (
      <Modal open={isModalOpen} onClose={() => setModalOpen(false)} size="small" mountNode={rootEl}>
        <Modal.Header>
          <Trans i18nKey="price.request.mass.modal.title" />
        </Modal.Header>

        <Modal.Content>
          <AutoForm
            schema={existingPriceRequestSchema}
            onSubmit={handleSubmit}
            ref={ref => {
              formRef = ref;
            }}
          >
            <Grid columns={2} verticalAlign="bottom" relaxed>
              <Grid.Column textAlign="center">
                <h3>
                  <Trans i18nKey="price.request.mass.modal.create.title" />
                </h3>
                <Button primary disabled={isMassPriceLoading} onClick={handleNew}>
                  <Trans i18nKey="price.request.mass.modal.create.button" />
                </Button>
              </Grid.Column>
              <Grid.Column textAlign="center">
                <h3>
                  <Trans i18nKey="price.request.mass.modal.existing.title" />
                </h3>
                <SelectField name="priceRequestId" options={priceRequestOptions} />
                <Button primary disabled={isMassPriceLoading} onClick={() => formRef.submit()}>
                  <Trans i18nKey="form.save" />
                </Button>
              </Grid.Column>
            </Grid>
            <Divider vertical>Or</Divider>
          </AutoForm>
        </Modal.Content>

        <Modal.Actions>
          <Button onClick={() => setModalOpen(false)}>
            <Trans i18nKey="form.cancel" />
          </Button>
        </Modal.Actions>
      </Modal>
    )
  };
};

export default initializePriceRequestModal;
