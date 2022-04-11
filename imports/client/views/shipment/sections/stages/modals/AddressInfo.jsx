import React from "react";

import { Trans } from "react-i18next";

import LocationTag from "/imports/client/components/tags/LocationTag.jsx";
import { ModalComponent } from "/imports/client/components/modals";
import { Grid } from "semantic-ui-react";

const AddressInfoModal = ({ ...props }) => {
  const { show, showModal, location } = props;

  return (
    <ModalComponent
      title={<Trans i18nKey="shipment.stage.confirm.title" />}
      show={show}
      showModal={showModal}
      body={
        <Grid columns={2}>
          <Grid.Row>
            <Grid.Column />
            <Grid.Column content={<LocationTag location={location} />} />
          </Grid.Row>
        </Grid>
      }
    />
  );
};

export default AddressInfoModal;
