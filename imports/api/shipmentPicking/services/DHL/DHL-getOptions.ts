import { rateRequest, getIsoDateTimeGmt } from "./DHL-node";
import {
  DEFAULT_OPTION_VALUE,
  SERVICE_MAP,
  COST_TYPE_MAP,
  getDhlDimensions,
  determineDHLContentType,
  getDhlAddressDefinition,
  getDhlContactDefinition
} from "./DHL-utils";
import { ExchangeRate } from "/imports/utils/functions/recalculateCosts.js";

import { SettingsType, ShipLocation } from "./interfaces.d";
import { ShipmentItemType } from "/imports/api/items/interfaces/shipmentItem.d";

const convert = require("convert-units");
const debug = require("debug")("shipmentpicking:getLabelsOptions:query");

interface Props {
  settings: SettingsType;
  shipment?: {
    _id: string;
    pickup: { location: ShipLocation };
    delivery: { location: ShipLocation };
    number: string;
    references: Object;
    incoterm?: string;
  };
  items: Array<ShipmentItemType>;
}

export const getDHLOptions = async ({
  settings,
  shipment,
  items = []
}: Props) => {
  const { defaults } = settings;
  const {
    pickup: { location: shipFrom },
    delivery: { location: shipTo }
  } = shipment || {};

  const dhlContentType = determineDHLContentType(
    shipFrom.countryCode,
    shipTo.countryCode,
    settings
  );

  const req = {
    ClientDetail: {},
    RequestedShipment: {
      DropOffType: defaults.DropOffType || "REGULAR_PICKUP",
      Ship: {
        Shipper: getDhlAddressDefinition(shipFrom),
        Recipient: {
          ...getDhlAddressDefinition(shipTo),
          ...(shipTo.phoneNumber
            ? {
                Contact: getDhlContactDefinition(shipTo)
              }
            : {})
        }
      },
      Packages: {
        RequestedPackages: items.map((item, i) => ({
          attributes: {
            number: i + 1
          },
          Weight: {
            Value: item.weight_gross
              ? convert(item.weight_gross)
                  .from(item.weight_unit || "kg")
                  .to("kg")
              : 1
          }, // be carefull to add the Value key!!!
          Dimensions: getDhlDimensions(item?.dimensions, 40)
        }))
      },

      // shipment.pickup.datePlanned
      ShipTimestamp: getIsoDateTimeGmt(),
      NextBusinessDay: "Y",
      UnitOfMeasurement: "SI",
      Content: dhlContentType,
      PaymentInfo: shipment?.incoterm || "DDP",
      Account: Number(settings.accountNumber)

      // to do : DeclaredValue
    }
  };
  debug("rates req %j", req);

  const result = await rateRequest(settings, req);
  debug("dhl rates %o", JSON.stringify(result.response));
  if (
    result.response.Provider.Notification &&
    !result.response.Provider.Service
  ) {
    debug("ERROR: %o", result.response.Provider.Notification);
    throw Error(JSON.stringify(result.response.Provider.Notification));
  }
  debug("rates return %o", result.response.Provider.Service);
  const exchangeRate = await new ExchangeRate().useLatestExchangeRate();
  const rates = result.response.Provider.Service.filter(
    rate => rate.TotalNet[0]?.Amount > 0 // filtering out the non-valid options
  ).map(rate => {
    const service = SERVICE_MAP[rate.attributes?.type]?.name;

    const charges = [];
    (rate.Charges || []).forEach(({ Currency, Charge }) => {
      Charge.forEach(({ ChargeType, ChargeAmount, ChargeCode }) => {
        const costId =
          (!ChargeCode ? COST_TYPE_MAP.base : COST_TYPE_MAP[ChargeCode]) ??
          COST_TYPE_MAP.unmapped;
        charges.push({
          costId,
          isManualBaseCost: !ChargeCode,
          description: ChargeType,
          source: "api",
          amount: {
            value: Number(ChargeAmount),
            currency: Currency
          },
          meta: {
            chargeCode: ChargeCode
          }
        });
      });
    });

    return {
      ...DEFAULT_OPTION_VALUE,
      rateId: rate.attributes.type, // required!!
      serviceType: rate.attributes.type,
      status: "calculated",
      serviceLevel: {
        ...DEFAULT_OPTION_VALUE.serviceLevel,
        ...(service ? { name: service } : {}),
        token: rate.attributes?.type
      },
      amount: Boolean(rate.TotalNet[0].Currency)
        ? exchangeRate.convert(
            Number(rate.TotalNet[0].Amount),
            rate.TotalNet[0].Currency,
            "EUR"
          )
        : Number(rate.TotalNet[0].Amount),
      currency: "EUR",

      // to convert:
      amountLocal: Number(rate.TotalNet[0].Amount),
      currencyLocal: rate.TotalNet[0].Currency,
      charges,

      arrivesBy: rate.DeliveryTime,
      days: Math.ceil(
        (rate.DeliveryTime - rate.CutoffTime) / (1000 * 60 * 60 * 24)
      )
    };
  });

  return rates || [];
};
