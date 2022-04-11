import React from "react";
import moment from "moment";
import get from "lodash.get";
import { useApolloClient } from "@apollo/client";
import { toast } from "react-toastify";
import SimpleSchema from "simpl-schema";
import { Trans, useTranslation } from "react-i18next";
import dot from "dot-object";
import { Icon, Grid } from "semantic-ui-react";

import { AutoForm, ErrorsField } from "uniforms-semantic";
import {
  ModalComponent,
  ModalActions
} from "/imports/client/components/modals";
import { DateTimeComboWithTZField } from "/imports/client/components/forms/uniforms";

import { SCHEDULED_DATE_RECIPE } from "/imports/api/stages/enums/fieldMaps";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { getTimezoneOffset } from "/imports/utils/functions/timeConverter";

import { SCHEDULE_STAGE } from "../utils/queries";

const debug = require("debug")("shipment:stage");

// eslint-disable-next-line new-cap
const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

let formRef;
const ScheduleForm = ({ stage, onSubmitForm }) => {
  const { t } = useTranslation();
  const model = dot.transform(SCHEDULED_DATE_RECIPE, stage);

  const setTimeStamp = (dir: string, loc: string): void => {
    const locationTZ = get(stage, [loc, "timeZone"]);
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

    formRef.change(dir, ts);
    toast.info(`TimeStamp set for ${dir}`);
  };

  return (
    <AutoForm
      schema={
        new SimpleSchema2Bridge(
          new SimpleSchema({
            loading: Date,
            unloading: Date
          })
        )
      }
      model={model}
      onSubmit={onSubmitForm}
      ref={ref => {
        formRef = ref;
      }}
    >
      <Grid columns={2} verticalAlign="bottom">
        {[
          ["loading", "from"],
          ["unloading", "to"]
        ].map(([dir, loc]) => (
          <Grid.Row key={dir}>
            <Grid.Column width={15}>
              <DateTimeComboWithTZField
                name={dir}
                groupLabel={t(`stage.form.${dir}`)}
                dateLabel="date"
                timeLabel="time"
                locationTimeZone={get(stage, [loc, "timeZone"])}
                disableTimeToggle={undefined}
                required={undefined}
              />
            </Grid.Column>
            <Grid.Column width={1} style={{ marginBottom: "25px" }}>
              <Icon
                name="clock"
                color="blue"
                style={{ cursor: "pointer" }}
                onClick={() => setTimeStamp(dir, loc)}
              />
            </Grid.Column>
          </Grid.Row>
        ))}
      </Grid>
      <ErrorsField />
    </AutoForm>
  );
};

const ScheduleStageModal = ({ ...props }) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const { show, showModal, stage } = props;

  const onSubmitForm = async ({ loading, unloading }) => {
    const stageId = stage.id;

    debug("schedule update %o", { loading, unloading });

    try {
      const { errors } = await client.mutate({
        mutation: SCHEDULE_STAGE,
        variables: {
          input: { stageId, loading, unloading }
        }
      });

      if (errors) throw errors;
      toast.success("Stage scheduled");
      showModal(false);
    } catch (error) {
      console.error({ error });
      toast.error("Could not update stage");
    }
  };

  return (
    <ModalComponent
      title={<Trans i18nKey="shipment.stage.confirm.title" />}
      show={show}
      className="stage-split"
      showModal={showModal}
      body={<ScheduleForm stage={stage} onSubmitForm={onSubmitForm} />}
      actions={
        <ModalActions
          {...{
            showModal,
            onSave: () => formRef.submit(),
            saveLabel: t("stage.form.submit")
          }}
        />
      }
      trigger={undefined}
      scrolling={undefined}
    />
  );
};

export default ScheduleStageModal;
