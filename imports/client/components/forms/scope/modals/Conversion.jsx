import React, { useState } from "react";
import PropTypes from "prop-types";
import { Trans, useTranslation } from "react-i18next";
import { uoms } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_units";
import { AutoField, AutoForm } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { Form, Header } from "semantic-ui-react";
import { SelectField } from "/imports/client/components/forms/uniforms";
import {
  ModalComponent,
  ModalActionsClose,
  ModalActionsDelete,
  ModalActions
} from "/imports/client/components/modals";

import { UOMConversionSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/priceListUOMConversion.js";
import { conversionType } from "../utils/propTypes";

const debug = require("debug")("scope:conversion");

const schema = new SimpleSchema2Bridge(UOMConversionSchema);

function generateTitle(props) {
  let l;
  if (props.isLocked) {
    l = "view";
  } else if (props.index > -1) {
    l = "edit";
  } else {
    l = "add";
  }
  return <Trans i18nKey={`conversions.${l}`} />;
}

let formRef;

const UOMConversionForm = ({ conversion, disabled, onSubmitForm }) => {
  const { t } = useTranslation();
  const UOMoptions = uoms.map(uom => ({
    value: uom,
    text: uom
  }));

  return (
    <AutoForm
      schema={schema}
      disabled={disabled}
      model={conversion}
      ref={ref => {
        formRef = ref;
      }}
      onSubmit={onSubmitForm}
    >
      <Header dividing content={t("price.list.conversions.from")} />
      <Form.Group widths={3}>
        <SelectField
          name="from.uom"
          label={t("price.list.conversions.uom")}
          placeholder={t("price.list.conversions.uomPlaceholder")}
          options={UOMoptions}
        />
        <AutoField
          name="from.range.from"
          label={t("price.list.conversions.range.from")}
          placeholder={t("price.list.conversions.rangePlaceHolder")}
        />
        <AutoField
          name="from.range.to"
          label={t("price.list.conversions.range.to")}
          placeholder={t("price.list.conversions.rangePlaceHolder")}
        />
      </Form.Group>
      <Header dividing content={t("price.list.conversions.to")} />
      <Form.Group widths={3}>
        <SelectField
          name="to.uom"
          label={t("price.list.conversions.uom")}
          placeholder={t("price.list.conversions.uomPlaceholder")}
          options={UOMoptions}
        />
        <AutoField
          name="to.fixed"
          label={t("price.list.conversions.fixed")}
          placeholder={t("price.list.conversions.fixedPlaceholder")}
        />
        <AutoField
          name="to.multiplier"
          label={t("price.list.conversions.multiplier")}
          placeholder={t("price.list.conversions.multiplierPlaceholder")}
        />
      </Form.Group>
      <Form.Group widths={2}>
        <AutoField
          name="to.min"
          label={t("price.list.conversions.minFillout")}
          placeholder={t("price.list.conversions.minPlaceholder")}
        />
        <AutoField
          name="to.max"
          label={t("price.list.conversions.maxFillout")}
          placeholder={t("price.list.conversions.maxPlaceholder")}
        />
      </Form.Group>
    </AutoForm>
  );
};

const UOMConversionModal = ({ ...props }) => {
  const [isSaving, setSaving] = useState(false);
  const { show, isLocked, index, showModal, conversion, conversions, onSave } = props;
  const title = generateTitle(props);

  const onSubmitForm = data => {
    let mod = conversions || [];
    setSaving(true);

    if (index > -1) {
      mod = mod.map((item, i) => (i === index ? data : item));
    } else {
      mod = [...mod, data];
    }
    debug("update: %o", mod);
    onSave({ conversions: mod }, () => setSaving(false));
  };

  const onDelete = () => {
    const mod = conversions.filter((item, i) => i !== index);
    onSave({ "uoms.conversions": mod });
  };
  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={title}
      body={<UOMConversionForm {...{ conversion, disabled: isLocked, onSubmitForm }} />}
      actions={
        <>
          {isLocked && <ModalActionsClose {...{ showModal }} />}
          {!isLocked && !!conversion && (
            <ModalActionsDelete
              {...{
                showModal,
                disabled: isSaving,
                onSave: () => formRef.submit(),
                onDelete: () => onDelete(index)
              }}
            />
          )}
          {!isLocked && !conversion && (
            <ModalActions {...{ showModal, disabled: isSaving, onSave: () => formRef.submit() }} />
          )}
        </>
      }
    />
  );
};

UOMConversionModal.propTypes = {
  show: PropTypes.bool,
  isLocked: PropTypes.bool,
  index: PropTypes.number,
  showModal: PropTypes.func,
  conversion: PropTypes.shape(conversionType),
  conversions: PropTypes.arrayOf(PropTypes.shape(conversionType)),
  onSave: PropTypes.func
};

export default UOMConversionModal;
