import React, { useRef } from "react";
import moment from "moment";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { Form } from "semantic-ui-react";
import { AutoForm } from "uniforms";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import {
  DateField,
  PartnerSelectField,
  ModeSelectField
} from "/imports/client/components/forms/uniforms";

import { ShipmentsFilterQueryShortSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_query";

const schema = new SimpleSchema2Bridge(ShipmentsFilterQueryShortSchema);

/**
 * this form lets you search, based on a stored scope, for the relevant shipment data & summarizes
 * for later analysis
 */
const ScopeQueryForm = React.forwardRef(({ onSubmitForm }, ref) => {
  // const
  const { t } = useTranslation();
  const model = {
    period: {
      from: moment()
        .startOf("month")
        .toDate(),
      to: moment()
        .subtract(1, "years")
        .startOf("month")
        .toDate()
    }
  };

  return (
    <AutoForm schema={schema} model={model} onSubmit={onSubmitForm} ref={ref}>
      <Form.Group widths={2}>
        <DateField name="period.from" label={t("form.shipments.query.dates.from")} />
        <DateField name="period.to" label={t("form.shipments.query.dates.to")} />
      </Form.Group>
      <Form.Group>
        <PartnerSelectField
          name="carrierId"
          options={{ type: "carrier" }}
          label={t("form.shipments.query.carriers")}
        />
        <ModeSelectField name="mode" label={t("form.shipments.query.mode")} />
      </Form.Group>
    </AutoForm>
  );
});

const ScopeDataQueryModal = ({ show, showModal, query, onSave }) => {
  const formRef = useRef();

  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title="Query shipment data"
      body={
        <ScopeQueryForm
          {...{
            ref: formRef,
            query,
            onSubmitForm: onSave
          }}
        />
      }
      actions={
        <ModalActions
          {...{
            showModal,
            onSave: () => {
              formRef.current.submit();
            }
          }}
        />
      }
    />
  );
};

ScopeDataQueryModal.propTypes = {
  show: PropTypes.bool,
  showModal: PropTypes.func,
  onSave: PropTypes.func
};

export default ScopeDataQueryModal;
