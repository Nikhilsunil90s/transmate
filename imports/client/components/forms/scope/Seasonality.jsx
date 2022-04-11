import React from "react";
import { useTranslation } from "react-i18next";
import { AutoForm, RadioField } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { ScopeSeasonalitySchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_scope.js";

const schema = new SimpleSchema2Bridge(ScopeSeasonalitySchema);

const Seasonality = ({ ...props }) => {
  const { t } = useTranslation();
  const { onSave, canEdit } = props;
  return (
    <AutoForm schema={schema} onSubmit={onSave} autosave autosaveDelay={5000} disabled={!canEdit}>
      <RadioField name="seasonality" transform={value => t(`scope.seasonality.${value}`)} />
    </AutoForm>
  );
};

export default Seasonality;
