import { GET_SETTINGS_DATA } from "/imports/client/components/forms/uniforms/EquipmentFilterField";
import { GET_PARTNERS } from "/imports/client/components/forms/uniforms/PartnerSelect.jsx";
import { GET_MY_PRICELISTS } from "/imports/client/components/forms/uniforms/DropdownSelectPriceListsField.jsx";

export const accountSettingsMock = {
  request: { query: GET_SETTINGS_DATA },
  result: {
    data: {
      accountSettings: {
        id: "accountId",
        itemUnits: null,
        __typename: "AccountSettings"
      }
    }
  }
};

export const partnersMock = {
  request: {
    query: GET_PARTNERS,
    variables: { includeInactive: true, types: ["carrier", "provider"] }
  },
  result: {
    data: {
      partners: [
        {
          id: "carrierId1",
          name: "Carrier 1",
          type: "carrier",
          __typename: "AccountTypeD"
        }
      ]
    }
  }
};

export const priceListsMock = {
  request: {
    query: GET_MY_PRICELISTS,
    variables: { input: { type: "contract", status: "approved" } }
  },
  result: {
    data: {
      priceLists: [
        {
          id: "priceListId",
          title: "Price List title",
          carrierId: "carrierId",
          carrierName: "Carrier 1",
          type: "contract",
          status: "active",
          __typename: "PriceList"
        }
      ]
    }
  }
};

export const lookupResult = {
  costs: [
    {
      id: "priceListId1",
      bestCost: true,
      bestLeadTime: false,
      calculation: {},
      carrierId: "carrierId1",
      carrierName: "Carrier 1",
      category: "contract",
      costs: [
        {
          rate: {
            amount: {
              unit: "EUR",
              value: 20,
              __typename: "PriceListRateAmountType"
            },
            name: "base rate",
            tooltip:
              "0.04 EUR per kg | lane: zone 1 LTL | volume: 2000 - 33000 kg",
            __typename: "PriceListRate"
          },
          total: {
            convertedCurrency: "USD",
            convertedValue: 1120.0,
            exchange: 1.12,
            listCurrency: "EUR",
            listValue: 1000,
            __typename: "PriceLookupCostTotal"
          },
          __typename: "PriceLookupCost"
        },
        {
          rate: {
            amount: { unit: "EUR", value: 20 },
            name: "base rate",
            tooltip:
              "0.04 EUR per kg | lane: zone 1 LTL | volume: 2000 - 33000 kg",
            __typename: "PriceListRate"
          },
          total: {
            convertedCurrency: "USD",
            convertedValue: 50,
            exchange: 1,
            listCurrency: "USD",
            listValue: 50,
            __typename: "PriceLookupCostTotal"
          },
          __typename: "PriceLookupCost"
        }
      ],
      customerId: "CustomerId1",
      leadTime: {
        definition: {},
        hours: 48
      },
      mode: "road",
      status: "active",
      title: "pricelist title 1",
      totalCost: 1170,
      validFrom: new Date().getTime(),
      validTo: new Date().getTime()
    },
    {
      id: "priceListId2",
      bestCost: false,
      bestLeadTime: true,
      calculation: {},
      carrierId: "carrierId2",
      carrierName: "Carrier 2",
      category: "contract",
      costs: [
        {
          rate: {
            amount: { unit: "EUR", value: 20 },
            name: "base rate",
            tooltip:
              "0.04 EUR per kg | lane: zone 1 LTL | volume: 2000 - 33000 kg",
            __typename: "PriceListRate"
          },
          total: {
            convertedCurrency: "USD",
            convertedValue: 2000,
            exchange: 1,
            listCurrency: "USD",
            listValue: 2000,
            __typename: "PriceLookupCostTotal"
          },
          __typename: "PriceLookupCost"
        }
      ],
      customerId: "CustomerId1",
      leadTime: {
        definition: {},
        hours: 40
      },
      mode: "road",
      status: "active",
      title: "pricelist title 2",
      totalCost: 2000,
      validFrom: new Date().getTime(),
      validTo: new Date().getTime()
    }
  ]
};
