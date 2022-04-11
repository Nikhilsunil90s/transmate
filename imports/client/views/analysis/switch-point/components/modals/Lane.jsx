import React from "react";
import PropTypes from "prop-types";
import { Trans, useTranslation } from "react-i18next";
import { AutoForm, AutoField } from "uniforms-semantic";
import { Form } from "semantic-ui-react";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";

import { DropdownCountryFlagField } from "/imports/client/components/forms/uniforms";
import { AnalysisFromToSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_analysis";

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    from: AnalysisFromToSchema,
    to: AnalysisFromToSchema
  })
);

let formRef;
const LaneForm = ({ lane, onSave }) => {
  const { t } = useTranslation();
  return (
    <AutoForm
      schema={schema}
      ref={ref => {
        formRef = ref;
      }}
      model={lane}
      onSubmit={onSave}
    >
      <Form.Field>
        <label>
          <Trans i18nKey="analysis.switchPoint.results.pickup" />
        </label>
        <Form.Group widths={2}>
          <DropdownCountryFlagField name="from.CC" label={t("analysis.switchPoint.results.cc")} />
          <AutoField name="from.zip" label={t("analysis.switchPoint.results.zip")} />
        </Form.Group>
      </Form.Field>
      <Form.Field>
        <label>
          <Trans i18nKey="analysis.switchPoint.results.delivery" />
        </label>
        <Form.Group widths={2}>
          <DropdownCountryFlagField name="to.CC" label={t("analysis.switchPoint.results.cc")} />
          <AutoField name="to.zip" label={t("analysis.switchPoint.results.zip")} />
        </Form.Group>
      </Form.Field>
    </AutoForm>
  );
};

const SwitchPointAnalyisLaneModal = ({ show, showModal, lane, onSave }) => {
  const { t } = useTranslation();
  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={t("analysis.switchPoint.form.modal.title")}
      body={<LaneForm lane={lane} onSave={onSave} />}
      actions={
        <ModalActions
          {...{
            showModal,
            onSave: () => formRef.submit()
          }}
        />
      }
    />
  );
};

SwitchPointAnalyisLaneModal.propTypes = {
  show: PropTypes.bool.isRequired,
  showModal: PropTypes.func.isRequired,
  index: PropTypes.number,
  lane: PropTypes.shape({
    from: PropTypes.shape({
      CC: PropTypes.string,
      zip: PropTypes.string
    }),
    to: PropTypes.shape({
      CC: PropTypes.string,
      zip: PropTypes.string
    })
  })
};

export default SwitchPointAnalyisLaneModal;
