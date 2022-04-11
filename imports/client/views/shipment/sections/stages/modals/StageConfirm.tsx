import React from "react";
import moment from "moment";
import get from "lodash.get";
import { useApolloClient } from "@apollo/client";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { toast } from "react-toastify";
import { Trans, useTranslation } from "react-i18next";
import dot from "dot-object";

import { AutoForm } from "uniforms-semantic";
import LocationTag from "/imports/client/components/tags/LocationTag";
import {
  ModalComponent,
  ModalActions
} from "/imports/client/components/modals";
import { Grid, Popup, Icon, Divider } from "semantic-ui-react";

import { DateTimeComboWithTZField } from "/imports/client/components/forms/uniforms";
import { CONFIRMATION_RECIPE } from "/imports/api/stages/enums/fieldMaps";
import { StageConfirmSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/stageConfirmSchema";
import { getTimezoneOffset } from "/imports/utils/functions/timeConverter";

import { CONFIRM_STAGE } from "../utils/queries";

const debug = require("debug")("shipment:stage");

// eslint-disable-next-line new-cap
const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

let formRef;

interface FromDatePickerProps {
  name: any
  location?: any
}

const FormDatePicker = ({ name, location }:FromDatePickerProps) => {
  const locationTZ = get(location, ["timeZone"]);
  const setTimeStamp = () => {
    const hourDiffs = {
      userTZ: getTimezoneOffset(userTZ) / 60,
      locationTZ: locationTZ
        ? getTimezoneOffset(locationTZ) / 60
        : getTimezoneOffset(userTZ) / 60
    };
    const hourDiffBetweenLocalAndUser = hourDiffs.locationTZ - hourDiffs.userTZ;
    const ts = moment()
      .seconds(0)
      .milliseconds(0)
      .add(-hourDiffBetweenLocalAndUser, "hours") // will force the timeStamp (now) onto the location
      .toDate();

    formRef.change(name, ts);
    toast.info(`TimeStamp set for ${name}`);
  };

  return (
    <div className="form-date-picker-container">
      <DateTimeComboWithTZField name={name} locationTimeZone={locationTZ} />
      <Popup
        content="Set timestamp"
        trigger={
          <span className="time-stamp">
            <Icon
              name="stopwatch"
              color="blue"
              onClick={setTimeStamp}
              style={{ cursor: "pointer", marginTop: "13px" }}
            />
          </span>
        }
      />
    </div>
  );
};

const FormRow = ({ name, location, title }) => {
  return (
    <Grid.Row>
      <Grid.Column width={6}>
        <div className="item-icon">
          <Icon size="large" name="map marker alternate" />
          <div>
            <h4>{title}</h4>
            <LocationTag location={location} />
          </div>
        </div>
      </Grid.Column>
      <Grid.Column width={10}>
        <div className="field">
          <label>
            <Trans i18nKey="shipment.stage.confirm.arrival" />
          </label>
          <FormDatePicker name={`${name}Arrival`} location={location} />
        </div>

        <div className="field">
          <label>
            <Trans i18nKey="shipment.stage.confirm.start" />
          </label>
          <FormDatePicker name={`${name}Start`} location={location} />
        </div>

        <div className="field">
          <label>
            <Trans i18nKey="shipment.stage.confirm.end" />
          </label>
          <FormDatePicker name={`${name}End`} location={location} />
        </div>
      </Grid.Column>
    </Grid.Row>
  );
};

export const ConfirmForm = ({ stage, onSubmitForm }) => {
  const model = dot.transform(CONFIRMATION_RECIPE, stage);

  return (
    <AutoForm
      schema={new SimpleSchema2Bridge(StageConfirmSchema)}
      model={model}
      onSubmit={onSubmitForm}
      ref={ref => {
        formRef = ref;
      }}
    >
      <Grid columns={3}>
        <FormRow
          name="pickup"
          location={stage.from}
          title={<Trans i18nKey="shipment.stage.pickup" />}
        />

        <Divider />

        <FormRow
          name="delivery"
          location={stage.to}
          title={<Trans i18nKey="shipment.stage.delivery" />}
        />
      </Grid>
    </AutoForm>
  );
};

const ConfirmStageModal = ({ ...props }) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const { show, showModal, stage } = props;

  const confirmDate = async dates => {
    const stageId = stage.id;

    debug("confirmed dates: %o", dates);
    if (!(Object.keys(dates).length > 0)) return;

    try {
      await client.mutate({
        mutation: CONFIRM_STAGE,
        variables: {
          input: {
            stageId,
            dates
          }
        }
      });
      toast.success("Stage modified");
      showModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Could not update stage");
    }
  };

  return (
    <ModalComponent
      title={<Trans i18nKey="shipment.stage.confirm.title" />}
      show={show}
      showModal={showModal}
      body={<ConfirmForm stage={stage} onSubmitForm={confirmDate} />}
      actions={
        <ModalActions
          {...{
            showModal,
            onSave: () => formRef.submit(),
            saveLabel: t("shipment.stage.confirm.save")
          }}
        />
      }
      trigger={undefined}
      scrolling={undefined}
    />
  );
};

export default ConfirmStageModal;
