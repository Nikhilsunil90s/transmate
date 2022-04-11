import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";
import { Button, Container, Grid, Segment } from "semantic-ui-react";
import { AutoForm, ErrorsField } from "uniforms-semantic";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";
import { LocationSchema } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/from-to";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import AddressInput from "/imports/client/components/forms/input/Address.jsx";
import {
  EquipmentFilterField,
  LabeledInputField

  // CurrencySelectField,
} from "/imports/client/components/forms/uniforms";
import { GET_ROUTE_INSIGHTS, GET_USAGE } from "./utils/queries";
import ToolsRouteInsightResult from "./components/Results.jsx";
import { UOMS } from "/imports/api/_jsonSchemas/enums/units";

const debug = require("debug")("tools:routeInsight");

const DEFAULT_UOM = "kg";
const DEFAULT_CURRENCY = "EUR";

//#region components
const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    from: { type: LocationSchema },
    to: { type: LocationSchema },

    // currency: { type: String, defaultValue: "EUR" },
    equipment: { type: Object, blackbox: true, optional: true },
    goods: {
      optional: true,
      type: new SimpleSchema({
        amount: Number,
        code: String
      })
    }
  })
);

let formRef;
const SearchForm = ({ onSubmitForm }) => {
  const { t } = useTranslation();
  const [isDetailSearch, setShowDetailSearch] = useState(false);
  return (
    <AutoForm
      schema={schema}
      model={{ goods: { amount: 0, code: DEFAULT_UOM } }}
      onSubmit={onSubmitForm}
      onChangeModel={console.log}
      ref={ref => {
        formRef = ref;
      }}
    >
      <Grid stackable columns={2}>
        <Grid.Column>
          <AddressInput
            name="from"
            label={t("tools.routeInsights.pickup.location")}
            options={{ excludeGlobal: true, excludeLocodes: false }}
          />
        </Grid.Column>
        <Grid.Column>
          <AddressInput
            name="to"
            label={t("tools.routeInsights.delivery.location")}
            options={{ excludeGlobal: true, excludeLocodes: false }}
          />
        </Grid.Column>
      </Grid>

      <a onClick={() => setShowDetailSearch(!isDetailSearch)}>
        {isDetailSearch ? "show less..." : "show more..."}{" "}
      </a>

      {isDetailSearch && (
        <Grid stackable relaxed columns={3}>
          <Grid.Column width={6}>
            <EquipmentFilterField name="equipment" />
          </Grid.Column>
          <Grid.Column width={6}>
            <LabeledInputField
              type="number"
              placeholder={t("form.quantity")}
              inputName="goods.amount"
              label={t("shipment.form.item.weight_gross")}
              dropdownName="goods.code"
              dropdownOptions={UOMS.map(value => ({ value, text: value }))}
              dropdownDefaultValue={DEFAULT_UOM}
            />
          </Grid.Column>
          <Grid.Column width={4}>
            {/* <CurrencySelectField name="currency" label={t({"components.currency.label"} />} ) */}
          </Grid.Column>
        </Grid>
      )}

      <ErrorsField />
    </AutoForm>
  );
};

//#endregion

const ToolsRouteInsight = () => {
  const [isSearched, setSearched] = useState(false);
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [getRouteInsights, { loading, data = {}, error }] = useMutation(GET_ROUTE_INSIGHTS, {
    refetchQueries: [
      {
        query: GET_USAGE,
        variables: { input: { activity: "tools.route-insight", thisMonthOnly: true } }
      }
    ]
  });
  if (error) console.error({ error });
  const routeInsights = data.insights || {};
  debug("results", routeInsights);

  const onSubmitForm = formData => {
    debug("query %o", formData);
    if (formData.currency) {
      setCurrency(formData.currency);
    }
    setSearched(true);
    debug("search query", formData);
    getRouteInsights({ variables: { input: formData } });
  };

  return (
    <>
      <div>
        <Container>
          <IconSegment
            name="routeInsights"
            icon="leaf"
            title={<Trans i18nKey="tools.routeInsights.title" />}
            body={<SearchForm onSubmitForm={onSubmitForm} />}
          />

          {isSearched && (
            <Segment padded="very" loading={loading}>
              <ToolsRouteInsightResult insight={routeInsights} currency={currency} />
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

export default ToolsRouteInsight;
