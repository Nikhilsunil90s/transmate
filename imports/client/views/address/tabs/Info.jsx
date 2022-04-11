import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { Grid, Icon } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import AddressNameModal from "../modals/Name";
import { DisplayMapClass } from "/imports/client/components/maps/HereMap";

const AddressInfoTab = ({ address = {}, security, onSave }) => {
  const { t } = useTranslation();
  const [show, showModal] = useState(false);
  const markers = address.location ? [{ coords: address.location, color: "green" }] : [];

  const onSubmitForm = ({ name, externalId }) => {
    onSave({ name, externalId }, () => showModal(false));
  };
  return (
    <>
      <IconSegment
        name="info"
        title={address.annotation?.name || ""}
        icon="marker"
        headerContent={security.canEdit && <Icon name="edit" onClick={() => showModal(true)} />}
        body={
          <Grid.Row>
            <Grid.Column>
              {t("address.form.streetShort")}: {address.street} {address.number} <br />
              {t("address.form.zip")}: {address.zip}, {t("address.form.city")}: {address.city}
              <br />
              {t("address.form.country")}: {address.country}
            </Grid.Column>
          </Grid.Row>
        }
      />
      <AddressNameModal {...{ show, showModal, address, onSubmitForm }} />
      {markers.length > 0 && (
        <DisplayMapClass {...{ height: 300, markers, mapType: "truck", maxZoom: 10 }} />
      )}
    </>
  );
};

export default AddressInfoTab;
