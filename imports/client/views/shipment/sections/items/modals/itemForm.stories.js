import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import {
  TAXABLE_OPTIONS_KEYS,
  DEFAULT_UNITS
} from "/imports/api/_jsonSchemas/enums/shipmentItems";
import { ItemForm } from "./ItemForm.jsx";
import { QuantityInputDropdown } from "./components/QuantityUnitDropDown";
import { Button } from "../../../../../components/forms/uniforms/RichText.components";

export default {
  title: "Shipment/Segments/items/form",
  decorators: [
    (Story, context) => {
      const { mocks = [], ...args } = context.args;
      return (
        <MockedProvider mocks={mocks} addTypename={false}>
          <Story {...args} />
        </MockedProvider>
      );
    }
  ]
};

const taxableOptions = TAXABLE_OPTIONS_KEYS;

const itemData = {
  DG: true,
  DGClassType: "some text",
  calcSettings: {
    costRelevant: true,
    itemize: true,
    keys: {
      kg: 1500,
      lm: 0.8,
      pal: 1
    }
  },
  commodity: "commodity",
  description: "some description",
  dimensions: {
    height: 30,
    length: 10,
    uom: "m",
    width: 20
  },
  itemType: "container",
  number: "number",
  quantity: {
    amount: 10,
    code: "20GE"
  },
  references: {
    containerNo: "container",
    delivery: "delivery",
    document: "document",
    order: "order",
    seal: "seal",
    trailerId: "trailer",
    truckId: "truck"
  },
  temperature: {
    condition: "some text",
    range: {
      from: 0,
      to: 10,
      unit: "C"
    }
  },
  type: "TU",
  weight_gross: 300,
  weight_net: 100,
  weight_tare: 200,
  weight_unit: "kg"
};

const security = {
  canEditItems: true,
  canEditItemReferences: true,
  canEditWeights: true
};

export const basic = () => {
  let formRef = null;
  return (
    <PageHolder main="Shipment">
      <div className="ui visible active modal">
        <div className="content">
          <ItemForm
            formRef={ref => {
              formRef = ref;
            }}
            taxableOptions={taxableOptions}
            onSubmit={data => {
              console.log("onSubmit>>>", data);
            }}
            security={security}
          />
        </div>
        <Button
          onClick={() => {
            formRef.submit();
          }}
        >
          Submit
        </Button>
      </div>
    </PageHolder>
  );
};

export const filledForm = () => {
  let formRef = null;

  return (
    <PageHolder main="Shipment">
      <div className="ui visible active modal">
        <div className="content">
          <ItemForm
            taxableOptions={taxableOptions}
            value={itemData}
            onSubmit={data => {
              console.log("onSubmit>>>", data);
            }}
            formRef={ref => {
              formRef = ref;
            }}
            security={security}
          />
        </div>
        <Button
          onClick={() => {
            formRef.submit();
          }}
        >
          Submit
        </Button>
      </div>
    </PageHolder>
  );
};

export const quantityDropdownTest = () => (
  <PageHolder main="Shipment">
    <QuantityInputDropdown options={DEFAULT_UNITS} />
  </PageHolder>
);
