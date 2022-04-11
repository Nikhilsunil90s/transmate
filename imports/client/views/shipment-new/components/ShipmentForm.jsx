import { toast } from "react-toastify";
import React, { useState } from "react";
import moment from "moment";
import { Trans, useTranslation } from "react-i18next";
import { useApolloClient } from "@apollo/client";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { Segment, Button, Grid, Header } from "semantic-ui-react";
import { AutoForm } from "uniforms-semantic";
import SimpleSchema from "simpl-schema";
import { LocationSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/from-to";

import AddressInput from "/imports/client/components/forms/input/Address.jsx";
import { DateTimeComboWithTZField } from "/imports/client/components/forms/uniforms";

import { CREATE_SHIPMENT } from "./queries";
import useRoute from "/imports/client/router/useRoute";
import { initModel } from "./initModel";

const debug = require("debug")("shipment:ui:create");
//#region components
const CreateShipmentSchema = new SimpleSchema({
  pickupLocation: {
    type: LocationSchema
  },
  pickupDate: Date,
  deliveryLocation: {
    type: LocationSchema
  },
  deliveryDate: Date
});

const schema = new SimpleSchema2Bridge(CreateShipmentSchema);
let formRef;

// update delivery Date based on pickup date change
class ChainForm extends AutoForm {
  onChange(key, value) {
    const model = this.getModel();
    if (key === "pickupDate") {
      if (!model.deliveryDate || value.getTime() > model.deliveryDate.getTime()) {
        super.onChange(
          "deliveryDate",
          moment(value)
            .add(1, "days")
            .toDate()
        );
      }
    }
    super.onChange(key, value);
  }
}
//#endregion

export const NewShipmentForm = ({ model = {}, disabled, onSubmitForm }) => {
  const [timeZones, setTimeZones] = useState({});
  const { t } = useTranslation();
  const initialData = {
    pickupDate: moment()
      .add(1, "days")
      .startOf("day")
      .hour(8)
      .toDate(),
    deliveryDate: moment()
      .add(2, "days")
      .startOf("day")
      .hour(8)
      .toDate(),
    ...model
  };

  const updateTimeZone = (tz, dir) => {
    setTimeZones({ ...timeZones, [dir]: tz });
  };

  return (
    <ChainForm
      schema={schema}
      model={initialData}
      disabled={disabled}
      onSubmit={onSubmitForm}
      showInlineError
      ref={ref => {
        formRef = ref;
      }}
    >
      <Grid stackable columns={2}>
        {["pickup", "delivery"].map(dir => (
          <Grid.Column key={dir}>
            <Header as="h4" dividing>
              <Trans i18nKey={`shipment.${dir}._`} />
            </Header>

            <AddressInput
              name={`${dir}Location`}
              label={t(`shipment.${dir}.location`)}
              onAddressChange={({ location: { timeZone } }) => updateTimeZone(timeZone, dir)}
              options={{ includeGlobal: false, allowCreate: true }}
            />
            <DateTimeComboWithTZField
              name={`${dir}Date`}
              dateLabel={t(`shipment.${dir}.date`)}
              timeLabel={t(`shipment.${dir}.time`)}
              locationTimeZone={timeZones[dir]}
            />
          </Grid.Column>
        ))}
      </Grid>
    </ChainForm>
  );
};

const ShipmentForm = ({ ...props }) => {
  const { params } = useRoute();
  const client = useApolloClient();
  const { isRequest, afterCreateCallback, shipment } = props;

  const model = initModel(shipment);

  const onSubmitForm = formData => {
    const post = {};
    ["pickup", "delivery"].forEach(dir => {
      post[dir] = {
        location: formData[`${dir}Location`],
        date: formData[`${dir}Date`]
      };
    });

    // optional query params for project link:
    const projectType = params.type;
    const { projectId } = params;

    // Create shipment
    const { pickup, delivery } = post;
    debug("call create mutation with ", { pickup, delivery, projectType, projectId });
    client
      .mutate({
        mutation: CREATE_SHIPMENT,
        variables: {
          input: { pickup, delivery, projectType, projectId, isRequest }
        }
      })
      .then(res => {
        debug("result of create %o", res);
        if (res.errors && Array.isArray(res.errors)) {
          res.errors.forEach(err => toast.error(err.message));
        } else {
          afterCreateCallback(res.data.shipmentId);
        }
      })
      .catch(error => {
        console.error(error);
        toast.error("Something has gone wrong. Your shipment was not saved.", {
          autoClose: 7000
        });
      });
  };
  return (
    <>
      <Segment
        padded="very"
        basic
        content={<NewShipmentForm {...{ ...props, model, onSubmitForm }} />}
      />
      <Segment
        as="footer"
        content={
          <Button
            primary
            content={<Trans i18nKey="shipment.form.submit" />}
            onClick={() => formRef.submit()}
          />
        }
      />
    </>
  );
};

export default ShipmentForm;
