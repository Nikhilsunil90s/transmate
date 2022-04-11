import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import get from "lodash.get";
import { useMutation } from "@apollo/client";

// UI
import { toast } from "react-toastify";
import { Accordion, Form, Grid } from "semantic-ui-react";
import { AutoForm, ErrorsField, NestField } from "uniforms-semantic";
import EntityFieldLoader from "/imports/client/components/forms/uniforms/EntityField.jsx";
import { serviceLevels } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_units.js";
import { SelectField, CostCenterSelectField } from "/imports/client/components/forms/uniforms";
import {
  ListItemField,
  ListField,
  ListAddField,
  ListDelField
} from "/imports/client/components/forms/uniforms/ListField";
import LabeledField from "/imports/client/components/forms/uniforms/LabeledField";
import { CostParamsSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/shipment-cost-params";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

import { UPDATE_COST_PARAMS } from "../utils/queries";
import LoginContext from "/imports/client/context/loginContext";

const INVOICE_FEATURE = "invoice-check";
const TEMP_DISABLED = true;

const schema = new SimpleSchema2Bridge(
  CostParamsSchema.pick("entity", "costCenterAllocation", "costCenterAllocation.$").extend({
    serviceLevel: { type: String, optional: true }
  })
);

function calculateTotalAllocation(costCenterAllocation = []) {
  return costCenterAllocation.reduce((acc, { allocation }) => acc + allocation, 0);
}

function calculateOpenAllocation(costCenterAllocation) {
  const totalAllocatedAmount = calculateTotalAllocation(costCenterAllocation || []);
  return totalAllocatedAmount > 100 ? 0 : 100 - totalAllocatedAmount;
}

const ShipmentCostAdvanced = ({ shipmentId, shipment, security }) => {
  const { account } = useContext(LoginContext);
  const { t } = useTranslation();
  const [openAllocation, setOpenAllocation] = useState(
    calculateOpenAllocation(get(shipment, ["costParams", "costCenterAllocation"], []))
  );
  const [updateCostParams] = useMutation(UPDATE_COST_PARAMS, {
    variables: {
      shipmentId
    },
    onError(error) {
      console.error({ error });
      toast.error("Could not save updates");
    },
    onCompleted() {
      toast.success("Changes saved");
    }
  });
  const hasInvoiceFeature = account?.hasFeature(INVOICE_FEATURE);
  const canEdit = security.canEditCostParams;
  const entity = get(shipment, "costParams.entity");
  const serviceLevel = get(shipment, "serviceLevel");

  const serviceLevelOptions = serviceLevels.map(sl => ({
    key: sl,
    value: sl,
    text: sl
  }));

  const submitForm = formData => {
    const updates = {};
    const fieldMap = {
      serviceLevel: "serviceLevel",
      entity: "costParams.entity"
    };

    Object.entries(formData).forEach(([k, v]) => {
      if (v) {
        updates[fieldMap[k]] = v;
      }
    });

    // onSave(update);
    updateCostParams({ variables: { shipmentId, updates } });
  };

  const panels = [
    {
      key: "advanced",
      title: t("form.advanced"),
      content: {
        content: (
          <AutoForm
            autosave
            autosaveDelay={2000}
            disabled={!canEdit}
            schema={schema}
            model={{ entity, serviceLevel }}
            onSubmit={submitForm}
            onChangeModel={model => {
              const openAllocationAmount = calculateOpenAllocation(model.costCenterAllocation);
              setOpenAllocation(openAllocationAmount);
            }}
            onValidate={model => {
              // custom validation to check if the total allocation == 100%
              const test = calculateTotalAllocation(model.costCenterAllocation) !== 100;
              if (model.costCenterAllocation?.length > 0 && test) {
                return new Error("Allocation should total 100%");
              }
              if (
                model.costCenterAllocation?.length > 0 &&
                model.costCenterAllocation.some(({ id }) => !id)
              ) {
                return new Error("Please select cost center");
              }
              return null;
            }}
          >
            <Form.Group>
              <Form.Field width={6}>
                <EntityFieldLoader name="entity" clearable />
              </Form.Field>
              <Form.Field width={5}>
                <SelectField
                  name="serviceLevel"
                  options={serviceLevelOptions}
                  placeHolder={t("shipment.form.costs.serviceLevel.placeholder")}
                  label={t("shipment.form.costs.serviceLevel.label")}
                />
              </Form.Field>
            </Form.Group>
            {hasInvoiceFeature && TEMP_DISABLED && (
              <Grid columns={2} stackable>
                <Grid.Row>
                  <Grid.Column>
                    <Form.Field>
                      <label>{t("shipment.form.costs.costCenterAllocation.label")}</label>
                    </Form.Field>
                    <ListField name="costCenterAllocation">
                      <ListItemField name="$" label={null}>
                        <NestField
                          grouped={false}
                          label={null}
                          name=""
                          style={{ margin: undefined }}
                        >
                          <CostCenterSelectField
                            name="id"
                            className="ten wide"
                            label={null}
                            required={null}
                            placeholder={t("shipment.form.costs.costCenterAllocation.placeholder")}
                          />
                          <LabeledField
                            className="four wide"
                            name="allocation"
                            inputLabel="%"
                            label={null}
                            required={null}
                          />
                          <ListDelField className="two wide" name="" />
                        </NestField>
                      </ListItemField>
                    </ListField>
                    {canEdit && (
                      <ListAddField
                        name="costCenterAllocation.$"
                        label={t("shipment.form.costs.costCenterAllocation.add")}
                        value={{ allocation: openAllocation }}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            )}
            <ErrorsField />
          </AutoForm>
        )
      }
    }
  ];
  return <Accordion defaultActiveIndex={-1} panels={panels} />;
};

export default ShipmentCostAdvanced;
