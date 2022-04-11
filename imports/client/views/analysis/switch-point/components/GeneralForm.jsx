import React, { useState } from "react";
import get from "lodash.get";
import pick from "lodash.pick";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { Trans, useTranslation } from "react-i18next";
import { AutoForm, AutoField } from "uniforms-semantic";
import { Form, Grid, Header, Segment, Button } from "semantic-ui-react";
import {
  CurrencySelectField,
  DropdownSelectPriceListsField,
  LabeledInputField
} from "/imports/client/components/forms/uniforms";
import { AnalysisSwitchPointSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/analysis-switch-point.js";
import { UOMS } from "/imports/api/_jsonSchemas/enums/units";

const UOM_DEFAULT = "kg";

const pureSchema = AnalysisSwitchPointSchema.pick("priceListIds", "params").extend({
  name: String
});
const schema = new SimpleSchema2Bridge(pureSchema);

let formRef;
const GeneralForm = ({ analysis, onSave }) => {
  const { t } = useTranslation();
  const [numPriceLists, setNumPriceLists] = useState(
    get(analysis, ["switchPoint", "priceListIds", "length"], 0)
  );
  const model = pick(analysis?.switchPoint, "name", "params", "priceListIds");
  return (
    <Segment padded="very">
      <AutoForm
        schema={schema}
        model={model}
        onChange={(field, value) => {
          if (field === "priceListIds") {
            setNumPriceLists((value || []).length);
          }
        }}
        ref={ref => {
          formRef = ref;
        }}
        onSubmit={onSave}
      >
        <Grid columns={2}>
          <Grid.Column>
            <Header as="h4" content={<Trans i18nKey="analysis.switchPoint.form.parameters" />} />
            <AutoField
              label={t("analysis.switchPoint.form.name")}
              name="name"
              placeholder={t("analysis.switchPoint.form.nameEnter")}
            />
            <Form.Group widths={2}>
              <LabeledInputField
                type="number"
                placeholder={t("price.switchPoint.form.intervalMaxPH")}
                inputName="params.max"
                label={t("shipment.form.item.weight_gross")}
                dropdownName="params.uom"
                dropdownOptions={UOMS.map(value => ({ value, text: value }))}
                dropdownDefaultValue={UOM_DEFAULT}
              />

              <CurrencySelectField
                label={t("analysis.switchPoint.form.currency")}
                name="params.currency"
              />
            </Form.Group>
          </Grid.Column>
          <Grid.Column>
            <Header as="h4" content={t("analysis.switchPoint.form.priceLists.title")} />
            <DropdownSelectPriceListsField
              label={t("analysis.switchPoint.form.priceLists.label")}
              name="priceListIds"
            />
            <br />
            <Trans
              i18nKey="analysis.switchPoint.form.priceLists.selected"
              values={{ count: numPriceLists }}
            />
          </Grid.Column>
        </Grid>
      </AutoForm>
      <Segment as="footer">
        <Button primary content={<Trans i18nKey="form.save" />} onClick={() => formRef.submit()} />
      </Segment>
    </Segment>
  );
};

export default GeneralForm;
