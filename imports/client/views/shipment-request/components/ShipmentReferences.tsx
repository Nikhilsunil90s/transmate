import React from "react";
import get from "lodash.get";
import { toast } from "react-toastify";
import { Trans } from "react-i18next";
import { useMutation } from "@apollo/client";
import { Button, Grid } from "semantic-ui-react";
import SectionWithFooter from "/imports/client/components/utilities/Section";
import { initJSONschema } from "/imports/utils/UI/initJSONschema";
import { AutoField, AutoForm, LongTextField } from "uniforms-semantic";

import {
  UPDATE_SHIPMENT_REFS,
  CONFIRM_SHIPMENT_REQUEST
} from "../utils/queries";

let formRef;
const schema = initJSONschema({
  title: "ShipmentReferencesSchema",
  type: "object",
  properties: {
    references: { type: "object", properties: { number: { type: "string" } } },
    notes: { type: "object", properties: { BookingNotes: { type: "string" } } }
  },
  required: []
});

const initModel = shipment => ({
  references: { number: get(shipment, "references.number") },
  notes: { BookingNotes: get(shipment, "notes.BookingNotes") }
});

/** section to capture references, notes, attachments, all relevant info for a shipment request */
const ShipmentReferences = ({ ...props }) => {
  const [saveShipmentRefs, { loading: isSavingRefs }] = useMutation(
    UPDATE_SHIPMENT_REFS
  );
  const [confirmRequest, { loading: isSubmittingRequest }] = useMutation(
    CONFIRM_SHIPMENT_REQUEST
  );
  const { shipmentId, shipment } = props;
  const model = initModel(shipment);
  const onSaveForm = updates => {
    saveShipmentRefs({ variables: { shipmentId, updates } });
  };

  function doCconfirmRequest() {
    confirmRequest({ variables: { shipmentId } }).catch(error => {
      console.error({ error });
      toast.error("Could not submit request");
    });
  }

  return (
    <SectionWithFooter
      footerContent={
        <>
          <div>
            <Button
              primary
              onClick={() => formRef.submit()}
              content={<Trans i18nKey="form.save" />}
              loading={isSavingRefs}
            />
            <Button
              primary
              onClick={doCconfirmRequest}
              content={<Trans i18nKey="form.submit" />}
              loading={isSubmittingRequest}
            />
          </div>
        </>
      }
    >
      <AutoForm
        schema={schema}
        model={model}
        ref={ref => {
          formRef = ref;
        }}
        onSubmit={onSaveForm}
      >
        <Grid stackable columns={2}>
          <Grid.Column>
            <AutoField
              name="references.number"
              label={<Trans i18nKey="shipment.references.number" />}
            />
          </Grid.Column>
          <Grid.Column>
            <LongTextField
              name="notes.BookingNotes"
              label={<Trans i18nKey="shipment.notes.BookingNotes" />}
            />
          </Grid.Column>
        </Grid>
      </AutoForm>
    </SectionWithFooter>
  );
};

export default ShipmentReferences;
