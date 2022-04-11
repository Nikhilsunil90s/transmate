import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import { Form } from "semantic-ui-react";
import { AutoField, AutoForm, ErrorsField } from "uniforms-semantic";
import { useTranslation } from "react-i18next";

import { existingOptionsDestruct } from "../../utils/optionsDestruct";
import packingSchema from "../../utils/packing.schema";
import { SelectField } from "/imports/client/components/forms/uniforms";
import {
  WEIGHT_DEFAULT,
  WEIGHT_OPTIONS,
  DIMENSION_OPTIONS,
  DIMENSION_DEFAULT
} from "/imports/api/_jsonSchemas/enums/units";
import LabeledField from "/imports/client/components/forms/uniforms/LabeledInputField";
import ItemSelectField from "/imports/client/components/forms/uniforms/ItemSelectField";

// import { packingUnitType, PackingFormModel } from "../../utils/interfaces";

const debug = require("debug")("picking:UI");

/*
type PackingFormProps = {
  existingItems: packingUnitType[],
  onSubmit: (a: PackingFormModel) => void,
  totalWeight: number
};
*/

// crucial is to segregate the parentItemId (existing packing unit) or code (new packing unit!!)
// if the parentItemId is given, it will mount the items underneath the existing packing unit
// if code is passed, it will create a new packing unit and mount it there.
const PackingForm = forwardRef(({ existingItems = [], onSubmit, totalWeight }, ref) => {
  const { t } = useTranslation();
  const model = {
    weight: totalWeight?.amount,
    weight_unit: totalWeight.uom || WEIGHT_DEFAULT,
    dimensions: {
      uom: DIMENSION_DEFAULT
    }
  };
  const weightOptions = WEIGHT_OPTIONS.map(key => ({
    key,
    text: key,
    value: key
  }));
  const dimensionOptions = DIMENSION_OPTIONS.map(key => ({
    key,
    text: key,
    value: key
  }));

  const onSelectUnit = packingUnitInfo => {
    debug("packing unit info %o", packingUnitInfo);
    if (packingUnitInfo?.dimensions && ref.current.change) {
      ref.current.change("dimensions", packingUnitInfo.dimensions);
    }
    if (packingUnitInfo.code && ref.current.change) {
      ref.current.change("code", packingUnitInfo.code);
      ref.current.change("description", packingUnitInfo.description);
    }
  };

  return (
    <AutoForm schema={packingSchema} model={model} onSubmit={onSubmit} ref={ref}>
      {Boolean(existingItems.length) && (
        <SelectField
          name="parentItem"
          label={t("picking.pack.exstingUnit")}
          placeholder={t("picking.pack.exstingUnit_PH")}
          options={existingOptionsDestruct(existingItems)}
        />
      )}

      <ItemSelectField
        name="parentItem"
        label={t("picking.pack.newUnit")}
        placeholder={t("picking.pack.newUnit_PH")}
        options={{ onlyPackingUnits: true }}
        onSelectUnit={onSelectUnit}
      />

      <Form.Group widths="equal">
        <LabeledField
          type="number"
          placeholder={t("form.quantity")}
          inputName="weight"
          label={t("picking.pack.weight")}
          dropdownName="weight_unit"
          dropdownOptions={weightOptions}
        />
        <AutoField
          name="dimensions.length"
          label={t("picking.pack.length")}
          type="number"
          placeholder={t("form.quantity")}
        />
        <AutoField
          name="dimensions.width"
          label={t("picking.pack.width")}
          type="number"
          placeholder={t("form.quantity")}
        />
        <LabeledField
          type="number"
          placeholder={t("form.quantity")}
          inputName="dimensions.height"
          label={t("picking.pack.height")}
          dropdownName="dimensions.uom"
          dropdownOptions={dimensionOptions}
        />
      </Form.Group>
      <ErrorsField />
    </AutoForm>
  );
});

PackingForm.propTypes = {
  existingItems: PropTypes.arrayOf(PropTypes.string),
  onSubmit: PropTypes.func.isRequired,
  totalWeight: PropTypes.shape({
    amount: PropTypes.number,
    uom: PropTypes.string
  })
};

export default PackingForm;
