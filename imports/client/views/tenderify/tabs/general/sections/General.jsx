import React from "react";
import dot from "dot-object";
import { toast } from "react-toastify";
import get from "lodash.get";
import { Trans, useTranslation } from "react-i18next";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";

// data
import { volumeUOMS, DEFAULT_VOLUME_UOM } from "/imports/api/_jsonSchemas/enums/tenderify";
import { Form, Grid, Button } from "semantic-ui-react";
import { AutoForm, AutoField, NumField, ErrorsField } from "uniforms-semantic";
import {
  DateTimeField,
  LabeledInputField,
  CurrencyAmountField
} from "/imports/client/components/forms/uniforms";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { TenderBidSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/tender-bid";
import { DateTag } from "/imports/client/components/tags";
import { UPDATE_TENDER_BID_GENERAL } from "../utils/queries";
import { useMutation } from "@apollo/client";

const debug = require("debug")("tenderBid");

const FIELDS = ["name", "tender"];
const FIELDS_DEEP = [
  "name",
  "tender.currentRound",
  "tender.totalRounds",
  "tender.volume",
  "tender.volumeUOM",
  "tender.revenue", // {value, unit}
  "tender.receivedDate",
  "tender.dueDate"
];
const schema = new SimpleSchema2Bridge(TenderBidSchema.pick(...FIELDS));

// Template.TenderifySectionGeneral.events({
//   "change input": function changeInputs(event, templateInstance) {
//     const { onSave } = templateInstance.data;
//     const $el = $(event.target);

//     const name = $el.attr("name");
//     const val = $el.val();

//     // do not update when updating dates / no name
//     if (
//       !name ||
//       [
//         "dueDate-time",
//         "dueDate-date",
//         "receivedDate-time",
//         "receivedDate-date"
//       ].includes(name)
//     )
//       return;

//     if (typeof onSave === "function") {
//       onSave({ [name]: val });
//     }
//   }
// });`
let formRef;
const GeneralForm = ({ tenderBid, security, onSubmit }) => {
  const { t } = useTranslation();
  const model = dot.object(
    FIELDS_DEEP.reduce((acc, path) => {
      acc[path] = get(tenderBid, path);
      return acc;
    }, {})
  );

  return (
    <AutoForm
      ref={ref => {
        formRef = ref;
      }}
      schema={schema}
      model={model}
      disabled={!security.editGeneral}
      onSubmit={onSubmit}
      onChangeModel={console.log}
    >
      <Grid columns={2}>
        <Grid.Row>
          <Grid.Column>
            <AutoField name="name" label={t("tenderify.tender.name")} placeholder="Enter Name" />
            <LabeledInputField
              type="number"
              placeholder="Enter Volume"
              inputName="tender.volume"
              label={t("tenderify.tender.volume")}
              dropdownName="tender.volumeUOM"
              dropdownOptions={volumeUOMS.map(value => ({ value, text: value }))}
              dropdownDefaultValue={DEFAULT_VOLUME_UOM}
            />
            <CurrencyAmountField name="tender.revenue" label={t("tenderify.tender.revenue")} />

            <Form.Field>
              <label>
                <Trans i18nKey="tenderify.round.title" />
              </label>
              <Form.Group widths={2}>
                <NumField name="tender.currentRound" />
                /
                <NumField name="tender.totalRounds" />
              </Form.Group>
            </Form.Field>
          </Grid.Column>
          <Grid.Column>
            {security.editGeneral ? (
              <DateTimeField
                name="tender.receivedDate"
                label={t("tenderify.tender.receivedDate")}
              />
            ) : (
              <Form.Field>
                <label>{t("tenderify.tender.receivedDate")}</label>
                <DateTag date={tenderBid.tender?.receivedDate} />
              </Form.Field>
            )}
            {security.editGeneral ? (
              <DateTimeField name="tender.dueDate" label={t("tenderify.tender.dueDate")} />
            ) : (
              <Form.Field>
                <label>{t("tenderify.tender.receivedDate")}</label>
                <DateTag date={tenderBid.tender?.dueDate} />
              </Form.Field>
            )}
            {/* <div class="field">
            <label>{{_ 'tenderify.tender.dueIn'}}</label>
            <div>
              {{> Countdown endTime=bid.tender.dueDate}}
            </div>
          </div> */}
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <ErrorsField />
    </AutoForm>
  );
};

const TenderifySectionGeneral = ({ ...props }) => {
  const { security, tenderBidId } = props;
  const [updateGeneralData, { loading }] = useMutation(UPDATE_TENDER_BID_GENERAL, {
    onCompleted() {
      toast.success("Changes stored");
    },
    onError(error) {
      console.error(error);
      toast.error("Could not save changes");
    }
  });
  const onSubmit = updates => {
    debug("update general", updates);

    // "name",
    // "tender.currentRound",
    // "tender.totalRounds",
    // "tender.volume",
    // "tender.volumeUOM",
    // "tender.revenue",
    // "tender.revenueCurrency",
    // "tender.receivedDate",
    // "tender.dueDate"
    updateGeneralData({ variables: { input: { tenderBidId, updates } } });
  };
  return (
    <IconSegment
      name="general"
      icon="cogs"
      title={<Trans i18nKey="tenderify.section.general.title" />}
      body={<GeneralForm {...props} onSubmit={onSubmit} />}
      footer={
        security.editGeneral ? (
          <Button
            primary
            content={<Trans i18nKey="form.save" />}
            onClick={() => formRef.submit()}
            loading={loading}
          />
        ) : null
      }
    />
  );
};

export default TenderifySectionGeneral;
