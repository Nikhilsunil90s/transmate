import React, { useState, useContext } from "react";
import get from "lodash.get";
import pick from "lodash.pick";
import { Trans, useTranslation } from "react-i18next";
import { Segment, Header, Form, Button } from "semantic-ui-react";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoForm, AutoField } from "uniforms-semantic";
import {
  SelectField,
  ModeSelectField,
  CurrencySelectField,
  LabeledInputField,
  PartnerSelectField,
  DateField
} from "/imports/client/components/forms/uniforms";
import LoginContext from "/imports/client/context/loginContext";

import {
  TYPES,
  PAYMENT_TERMS,
  DEFAULT_PAYMENT_TERM,
  CATEGORIES
} from "/imports/api/_jsonSchemas/enums/priceList";
import { PRICELIST_TEMPLATE_KEYS } from "/imports/api/_jsonSchemas/enums/priceListTemplates";
import { PriceListSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/price-list";

const debug = require("debug")("priceList:general");

const schema = new SimpleSchema2Bridge(
  PriceListSchema.pick(
    "title",
    "template",
    "mode",
    "currency",
    "type",
    "terms",
    "validFrom",
    "validTo",
    "carrierId",
    "category",
    "customerId"
  ).extend({
    termsDays: { type: Number, optional: true },
    termsCondition: { type: String, optional: true }
  })
);
let formRef;

/** general form that allows to modify general settings of price list */
const PriceListGeneralSection = ({ ...props }) => {
  const { t } = useTranslation();
  debug("load PriceListGeneralSection");
  const [hasChanges, setChanges] = useState(false);
  const { priceList, security = {}, onSave } = props;

  const saveForm = data => {
    const { changedMap } = formRef.state;
    const changedKeys = Object.keys(changedMap);
    onSave(pick(data, changedKeys), () => setChanges(false));
  };

  const curLogin = useContext(LoginContext);
  const accountType = get(curLogin, ["account", "type"]);
  const accountId = get(curLogin, ["account", "id"]);

  const customerFieldLabel =
    accountType === "shipper" ? (
      <Trans i18nKey="price.list.form.partner.currentAccount" />
    ) : (
      <Trans i18nKey="price.list.form.partner.myShippers" />
    );

  const carrierFieldLabel =
    accountType === "carrier" ? (
      <Trans i18nKey="price.list.form.carrier.currentAccount" />
    ) : (
      <Trans i18nKey="price.list.form.carrier.myCarriers" />
    );

  const canBePublic = ["provider", "carrier"].includes(accountType) && !priceList.customerId;

  return (
    <Segment padded="very" className="general">
      <Segment clearing>
        {hasChanges && (
          <Button
            floated="right"
            primary
            content={<Trans i18nKey="form.save" />}
            onClick={() => formRef.submit()}
            data-test="saveGeneralBtn"
          />
        )}
      </Segment>
      <AutoForm
        schema={schema}
        onSubmit={saveForm}
        model={priceList}
        onChangeModel={() => setChanges(true)}
        ref={ref => {
          formRef = ref;
        }}
        disabled={!security.canEdit}
      >
        <Header as="h3" dividing content={<Trans i18nKey="price.list.form.general" />} />
        <Form.Group>
          <AutoField
            className="ten wide"
            name="title"
            placeholder={t("price.list.form.namePH")}
            label={t("price.list.form.name")}
          />
          <SelectField
            className="ten wide"
            label={t("price.list.form.template")}
            options={[...PRICELIST_TEMPLATE_KEYS, "custom"].map(template => ({
              value: template,
              text: t(`price.list.form.templates.${template}`)
            }))}
            name="template.type"
          />
          <ModeSelectField
            className="three wide"
            label={t("price.list.form.transportMode.label")}
            name="mode"
          />
        </Form.Group>
        <Form.Group>
          <PartnerSelectField
            className="six wide"
            name="customerId"
            disabled={priceList.customerId === accountId}
            options={{ types: ["shipper", "provider"], includeOwnAccount: true }}
            label={customerFieldLabel}
            style={priceList.public ? { display: "none" } : {}}
          />
          {canBePublic && (
            <Segment>
              <p>
                <strong>
                  <Trans i18nKey="price.list.form.setPublic.title" />
                </strong>
                <br />
                <Trans i18nKey="price.list.form.setPublic.text" />
              </p>
              {/* <BoolField name="public" />
							<div class="ui toggle checkbox">
								<input type="checkbox" name="public" checked={{is type 'global'}}>
								<label>{{_ 'price.list.form.setPublic.checkBox'}}</label>
							</div> */}
            </Segment>
          )}
          <PartnerSelectField
            className="six wide"
            name="carrierId"
            options={{ types: ["carrier", "provider"], includeOwnAccount: true }}
            label={carrierFieldLabel}
          />
          <SelectField
            name="category"
            className="four wide"
            label={t("price.list.form.category.label")}
            options={CATEGORIES.map(el => ({
              value: el,
              text: t(`price.list.form.category.${el}`)
            }))}
          />
        </Form.Group>

        <Header as="h4" dividing content={<Trans i18nKey="price.list.form.terms.title" />} />
        <Form.Group>
          <SelectField
            className="five wide"
            label={t("price.list.form.type.label")}
            name="type"
            options={TYPES.map(el => ({
              value: el,
              text: t(`price.list.form.type.${el}`)
            }))}
          />
          <CurrencySelectField
            className="five wide"
            placeholder="Select currency"
            label={t("price.list.form.currency")}
            name="currency"
          />

          <LabeledInputField
            className="six wide"
            inputName="terms.days"
            dropdownName="terms.condition"
            label={t("price.list.form.paymentTerms")}
            placeholder={t("price.list.form.days.label")}
            dropdownOptions={PAYMENT_TERMS.map(k => ({
              value: k,
              text: t(`price.list.form.days.${k}`)
            }))}
            dropdownDefaultValue={DEFAULT_PAYMENT_TERM}
          />
        </Form.Group>
        <Form.Group widths={2}>
          <DateField name="validFrom" label={t("price.list.form.validFrom")} />
          <DateField name="validTo" label={t("price.list.form.validTo")} />
        </Form.Group>
      </AutoForm>
    </Segment>
  );
};

export default PriceListGeneralSection;
