import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";
import { Button, Container, Grid, Segment, Tab, Form } from "semantic-ui-react";
import { AutoForm, ErrorsField, BoolField } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";
import { LocationSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/from-to";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import AddressInput from "/imports/client/components/forms/input/Address.jsx";
import {
  EquipmentFilterField,
  CurrencySelectField,

  // DateField,
  PartnerSelectField,
  LabeledInputField,
  DropdownSelectPriceListsField,
  DropdownModes
} from "/imports/client/components/forms/uniforms";
import PriceLookupResults from "./components/Results";

import { UOMS } from "/imports/api/_jsonSchemas/enums/units.js";
import { DO_PRICE_LOOKUP, GET_USAGE } from "./utils/queries";

const debug = require("debug")("tools:priceLookup");

const DEFAULT_CURRENCY = "EUR";
const DEFAULT_GOODS_UOM = "kg";

//#region components
const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    from: { type: LocationSchema },
    to: { type: LocationSchema },
    pickupDate: { type: Date, optional: true },
    deliveryDate: { type: Date, optional: true },

    currency: { type: String, defaultValue: "EUR" },
    mode: { type: String, optional: true },
    equipment: { type: Object, blackbox: true, optional: true },
    goods: { type: Object, optional: true },
    "goods.amount": Number,
    "goods.code": { type: String, allowedValues: UOMS },
    fullLoad: { type: Boolean, defaultValue: false, optional: true },
    DG: { type: Boolean, optional: true },
    refrigerated: { type: Boolean, optional: true },
    carrierIds: { type: Array, optional: true },
    "carrierIds.$": String,
    priceListIds: { type: Array, optional: true },
    "priceListIds.$": String
  })
);

let formRef;
export const SearchForm = ({ onSubmitForm }) => {
  const { t } = useTranslation();
  const [isFullLoad, setFullLoad] = useState(false);
  return (
    <AutoForm
      schema={schema}
      onSubmit={onSubmitForm}
      onChange={(field, value) => {
        if (field === "fullLoad") {
          setFullLoad(value);
        }
      }}
      model={{
        priceListIds: [],
        carrierIds: [],
        goods: { amount: 0, code: "kg" }
      }}
      onChangeModel={console.log}
      ref={ref => {
        formRef = ref;
      }}
    >
      <Grid stackable columns={2}>
        {["from", "to"].map(dir => (
          <Grid.Column key={`column-${dir}`}>
            <AddressInput
              name={dir}
              label={t(`tools.priceLookup.lane.${dir}.location`)}
              options={{ excludeGlobal: true, excludeLocodes: false, allowCreate: true }}
            />
            {/* <DateField
              name={`${dir}Date`}
              dateLabel={t({`tools.priceLookup.lane.${dir}.date`} )}
              timeLabel={t({`tools.priceLookup.lane.${dir}.time`} )}
            /> */}
          </Grid.Column>
        ))}
      </Grid>

      <Tab
        style={{ marginTop: "30px" }}
        menu={{ secondary: true, pointing: true, stackable: true }}
        panes={[
          {
            menuItem: t("tools.priceLookup.tabs.items"),
            render: () => (
              <Tab.Pane>
                <Form.Group>
                  <EquipmentFilterField name="equipment" />
                  <BoolField name="fullLoad" label={t("tools.priceLookup.fullLoad")} />
                  {!isFullLoad && (
                    <LabeledInputField
                      type="number"
                      className="eight wide"
                      placeholder={t("form.quantity")}
                      inputName="goods.amount"
                      label={t("components.goods.label")}
                      dropdownName="goods.code"
                      dropdownOptions={UOMS.map(uom => ({ text: uom, value: uom }))}
                      dropdownDefaultValue={DEFAULT_GOODS_UOM}
                    />
                  )}
                </Form.Group>

                <Form.Field>
                  <label>
                    <Trans i18nKey="tools.priceLookup.conditions" />
                  </label>
                  <Form.Group>
                    <BoolField name="DG" />
                    <BoolField name="refrigerated" />
                  </Form.Group>
                </Form.Field>
              </Tab.Pane>
            )
          },

          // {
          //   menuItem: t('tools.priceLookup.tabs.route'),
          //   render: () => (
          //     <Tab.Pane>

          //     </Tab.Pane>
          //   )
          // },

          {
            menuItem: t("tools.priceLookup.tabs.options"),
            render: () => (
              <Tab.Pane>
                <Form.Group>
                  <DropdownSelectPriceListsField
                    name="priceListIds"
                    label={t("tools.priceLookup.priceLists")}
                    className="four wide"
                  />
                  <PartnerSelectField
                    name="carrierIds"
                    multiple
                    options={{
                      includeInactive: true,
                      types: ["carrier", "provider"]
                    }}
                    label={t("tools.priceLookup.partner.name")}
                    placeholder={t("tools.priceLookup.partner.select")}
                    className="eight wide"
                  />
                  <CurrencySelectField
                    name="currency"
                    className="four wide"
                    label={t("components.currency.label")}
                  />
                </Form.Group>
                <Form.Group>
                  <DropdownModes name="mode" />
                </Form.Group>
              </Tab.Pane>
            )
          }
        ]}
      />

      <ErrorsField />
    </AutoForm>
  );
};

//#endregion

const ToolsPriceLookup = () => {
  const { t } = useTranslation();
  const [isSearched, setSearched] = useState(false);
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [getPriceLookupResults, { loading, data = {}, error }] = useMutation(DO_PRICE_LOOKUP, {
    refetchQueries: [
      {
        query: GET_USAGE,
        variables: { input: { activity: "tools.price-lookup", thisMonthOnly: true } }
      }
    ]
  });
  if (error) console.error({ error });
  const resultData = data.getManualPriceLookupResult || {};
  debug("results", resultData);

  const onSubmitForm = ({ currency: selCurrency, ...params }) => {
    setCurrency(selCurrency);
    setSearched(true);
    debug("search query", params);
    getPriceLookupResults({ variables: { input: { params, options: { currency: selCurrency } } } });
  };

  return (
    <>
      <div>
        <Container>
          <IconSegment
            name="priceLookup"
            icon="search"
            title={t("tools.priceLookup.title")}
            body={<SearchForm onSubmitForm={onSubmitForm} />}
          />

          {isSearched && (
            <Segment padded="very" loading={loading}>
              <PriceLookupResults lookupResult={resultData} currency={currency} />
            </Segment>
          )}
        </Container>
      </div>

      <Segment as="footer">
        <div>
          <Button
            primary
            icon="search"
            content={<Trans i18nKey="components.search" />}
            onClick={() => formRef.submit()}
          />
        </div>
      </Segment>
    </>
  );
};

export default ToolsPriceLookup;
