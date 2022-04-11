import React, { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useApolloClient } from "@apollo/client";
import SimpleSchema from "simpl-schema";
import { Form, Button, Table, Accordion } from "semantic-ui-react";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

// UI
import { AutoForm, ErrorsField } from "uniforms-semantic";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";

import {
  SelectPriceListTemplateField,
  DateTimeField
} from "/imports/client/components/forms/uniforms";

import Toggle from "/imports/client/components/forms/uniforms/Toggle";
import PostponeDeadlineModal from "./modals/PostponeDeadline";

import { PriceListSettingsSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/priceListSettings";
import { tabPropTypes } from "../tabs/_tabProptypes";
import { mutate } from "/imports/utils/UI/mutate";

import { POSTPONE_DEADLINE } from "../utils/queries";

const debug = require("debug")("price-request:settings");

//#region components
let settingsForm;

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    dueDate: Date,
    settings: Object,
    "settings.templateId": String,
    "settings.templateSettings": { type: PriceListSettingsSchema }
  })
);

// eslint-disable-next-line no-underscore-dangle
const toggles = PriceListSettingsSchema._schemaKeys;

const SettingsForm = ({ priceRequest, canEdit, onSubmitForm, canViewSettings }) => {
  const { t } = useTranslation();
  const { __typename, ...settings } = priceRequest.settings || {};
  const formData = {
    settings,
    dueDate: new Date(priceRequest.dueDate)
  };
  debug({ canViewSettings, canEdit });
  return (
    <AutoForm
      schema={schema}
      model={formData}
      disabled={!canEdit}
      onSubmit={onSubmitForm}
      ref={ref => {
        settingsForm = ref;
      }}
    >
      <Form.Group widths={2}>
        <DateTimeField
          data-test="dueDate"
          name="dueDate"
          label={t("price.request.form.due")}
          placeholder={t("form.date")}
        />
        {canViewSettings && (
          <SelectPriceListTemplateField
            name="settings.templateId"
            label={t("price.request.form.settings.templateId")}
            placeholder={t("form.select")}
          />
        )}
      </Form.Group>
      {canViewSettings && (
        <Accordion
          panels={[
            {
              key: "advanced",
              title: "Advanced",
              content: {
                content: (
                  <Table compact celled definition>
                    <Table.Body>
                      <Table.Row>
                        <Table.HeaderCell />
                        <Table.HeaderCell>
                          <Trans i18nKey="price.request.form.settings.templateSettings" />
                        </Table.HeaderCell>
                      </Table.Row>
                      {toggles.map(key => (
                        <Table.Row key={key}>
                          <Table.Cell collapsing>
                            <Toggle name={`settings.templateSettings.${key}`} label={null} />
                          </Table.Cell>
                          <Table.Cell>
                            <Trans i18nKey={`price.request.form.settings.${key}`} />
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                )
              }
            }
          ]}
        />
      )}
      <ErrorsField />
    </AutoForm>
  );
};

//#endregion

export const PriceRequestSettings = ({
  priceRequestId,
  priceRequest = {},
  onSave,
  security = {}
}) => {
  const client = useApolloClient();
  const [show, showModal] = useState();
  const { canViewSettings, canPostponeDeadline, canEditSettings: canEdit } = security;

  debug("settings", { canViewSettings, canEdit, canPostponeDeadline });

  const onSubmitForm = update => {
    debug("update %o", { update });
    onSave({ update });
  };

  function onPostponeDeadline({ dueDate }) {
    debug("postpone priceRequest %o", { priceRequestId, dueDate });
    mutate(
      {
        client,
        query: {
          mutation: POSTPONE_DEADLINE,
          variables: { input: { priceRequestId, dueDate } }
        }
      },
      () => showModal(false)
    );
  }

  const segmentData = {
    name: "settings",
    icon: "cog",
    title: <Trans i18nKey="price.request.settings.title" />,
    body: <SettingsForm {...{ priceRequest, canEdit, onSubmitForm, canViewSettings }} />,
    footer:
      canEdit || canPostponeDeadline ? (
        <div>
          <Button
            primary
            disabled={!canEdit}
            content={<Trans i18nKey="form.save" />}
            onClick={() => settingsForm.submit()}
          />
          {canPostponeDeadline && (
            <>
              <Button
                primary
                basic
                content={<Trans i18nKey="price.request.settings.postpone.btn" />}
                onClick={() => showModal(true)}
                data-test="postponeDeadline"
              />
              <PostponeDeadlineModal
                {...{ show, showModal, onSave: onPostponeDeadline, dueDate: priceRequest.dueDate }}
              />
            </>
          )}
        </div>
      ) : null
  };

  return <IconSegment {...segmentData} />;
};

PriceRequestSettings.propTypes = tabPropTypes;

export default PriceRequestSettings;
