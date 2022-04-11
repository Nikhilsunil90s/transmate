import get from "lodash.get";
import { shipmentRequest, getIsoDateTimeGmt } from "./DHL-node";
import { uploadFileToAws } from "/imports/api/zz_utils/aws.js";
import { ExchangeRate } from "/imports/utils/functions/recalculateCosts.js";
import {
  getDhlDimensions,
  getWorkDay,
  determineDHLContentType,
  DHL_CARRIER_ID,
  getDhlAddressDefinition,
  getDhlContactDefinition
} from "./DHL-utils";
import { DhlConfirmLogging } from "./DhlConfirmLogging";

import { CustomsSummary } from "../../interfaces/labels.d";
import { SettingsType, ShipLocation, LabelType } from "./interfaces.d";
import { ShipmentItemType } from "/imports/api/items/interfaces/shipmentItem.d";

const fs = require("fs");

const convert = require("convert-units");
const debug = require("debug")("shipmentpicking:DHL:confirm");

const S3_FOLDER_NAME = "pickingLabels";
const S3_NAME_PREFIX = "label";

interface Props {
  settings: SettingsType;
  shipment: {
    _id: string;
    pickup: { location: ShipLocation };
    delivery: { location: ShipLocation };
    number: string;
    references: Object;
    incoterm?: string;
  };
  rateOptionId: string; // P | U | N | ....
  items: Array<ShipmentItemType>;
  customs: Array<CustomsSummary>;
  rate: { charges: Array<Object> };
  entity: {
    code: string;
    name: string;
    address?: string;
    zipCode?: string;
    city?: string;
    country: string;
    UID?: string;
    registrationNumber?: string;
    EORI?: string;
    VAT?: string;
    email?: string;
  };
}

/**
 * calls DHL API for method ShipmentRequest
 * @param {{settings: Object, shipment: Object, rateOptionId: String, items:[Object], customs:[Object]}} param0
 * @returns
 */
export const confirmDHLOption = async ({
  settings,
  shipment,
  entity,
  rateOptionId,
  items = [],
  customs = [],
  rate // rate info from getRatesOptions that holds cost info
}: Props) => {
  const { defaults } = settings;
  const {
    _id: shipmentId,
    pickup: { location: shipFrom },
    delivery: { location: shipTo },
    number,
    references
  } = shipment;
  debug("from %o to %o auth %o , item  %o ", shipFrom, shipTo, settings, items);
  debug("customs %o", customs);

  // const commodityDescription =
  //   item.quantity.description || item.description || "BOX";

  // const dimensions = getDhlDimensions(item?.dimensions, null);
  // if (!Object.values(dimensions).every(x => x))
  //   throw new Error("item should have dimensions set");

  const reference = get(references, "number", number);

  const dhlContentType = determineDHLContentType(
    shipFrom.countryCode,
    shipTo.countryCode,
    settings
  );

  debug("dhlDocuments ? %o", { dhlContentType });
  const exchangeRate = await new ExchangeRate().useLatestExchangeRate();
  debug("call api for items # %o", items.length);
  const req = {
    ClientDetail: {},
    RequestedShipment: {
      GetRateEstimates: "N",
      ShipmentInfo: {
        DropOffType: defaults.DropOffType || "REGULAR_PICKUP",
        ServiceType: rateOptionId,
        Account: Number(settings.accountNumber),
        Currency: defaults.Currency,
        UnitOfMeasurement: defaults.UnitOfMeasurement,
        PackagesCount: items.length,
        LabelType: "PDF",
        RequestAdditionalInformation: "Y",
        LabelTemplate: "ECOM26_84_001",

        // dhl commercial invoice for non dhlDocuments & prod server
        // works only on the prod server.
        ...(dhlContentType !== "DOCUMENTS" && !settings.sandbox
          ? {
              CustomsInvoiceTemplate: "COMMERCIAL_INVOICE_03",
              LabelOptions: {
                RequestDHLCustomsInvoice: "Y",
                DHLCustomsInvoiceLanguageCode: "eng",
                DHLCustomsInvoiceType: "PROFORMA_INVOICE"
              },
              SpecialServices: {
                Service: [
                  {
                    ServiceType: "WY"
                  }
                ]
              },
              PaperlessTradeEnabled: true
            }
          : {})
      },

      PaymentInfo: shipment.incoterm || "DDP",

      InternationalDetail: {
        Content: dhlContentType,
        ExportDeclaration: {
          InvoiceDate: new Date().toISOString().substring(0, 10),
          InvoiceNumber: shipmentId,
          ExportLineItems: {
            ExportLineItem: customs.map((customsItem, i) => ({
              ItemNumber: i + 1,
              CommodityCode: (customsItem.HSCode || "").replace(/\D+/g, ""), // different from item itself, this is from the aggregation, we only want numbers here
              ManufacturingCountryCode: "AT",
              Quantity: customsItem.quantity, // number of pieces
              QuantityUnitOfMeasurement: "PCS",
              ItemDescription: (customsItem.description || "").substring(0, 60),
              UnitPrice: exchangeRate
                .convert(
                  customsItem.unitPrice || 1,
                  customsItem.currency || "EUR",
                  defaults.Currency
                )
                .toFixed(2),
              NetWeight: convert(customsItem.weight_net)
                .from(customsItem.weight_unit || "kg")
                .to("kg"),
              GrossWeight: convert(customsItem.weight_gross)
                .from(customsItem.weight_unit || "kg")
                .to("kg")
            }))
          }
        },
        Commodities: {
          //  NumberOfPieces: items.length,
          Description: (
            items[0].commodity ||
            items[0].description ||
            items[0].quantity.description ||
            "BOX"
          ).substring(0, 35),
          CountryOfManufacture: "AT", // wrong key!!

          // Quantity: 1,

          // UnitPrice: 1, // to do
          CustomsValue: customs
            .reduce((total, custom) => {
              debug("CustomsValue:sum total %o value %o", total, custom.value);
              return (
                total +
                exchangeRate.convert(
                  custom.value,
                  custom.currency,
                  defaults.Currency
                )
              );
            }, 0)
            .toFixed(2)

          // initiate reduce with 0 else it does not work!
          // round to 2 digits
        }
      },

      Ship: {
        Shipper: {
          Contact: {
            PersonName: defaults.PersonName,
            CompanyName: defaults.CompanyName,
            PhoneNumber: defaults.PhoneNumber,
            EmailAddress: defaults.EmailAddress
          },
          Address: getDhlAddressDefinition(shipFrom),
          ...(entity && (entity.VAT?.length || entity.EORI?.length)
            ? {
                RegistrationNumbers: [
                  ["VAT", "VAT"],
                  ["EORI", "EOR"]
                ].reduce((acc: Array<any>, [k, dhlKey]) => {
                  if (entity[k]) {
                    acc.push({
                      RegistrationNumber: {
                        Number: entity[k],
                        NumberTypeCode: dhlKey,
                        NumberIssuerCountryCode: entity.country
                      }
                    });
                  }
                  return acc;
                }, [])
              }
            : {})
        },
        Recipient: {
          Contact: getDhlContactDefinition(shipTo),
          Address: getDhlAddressDefinition(shipTo)
        }
      },
      Packages: {
        RequestedPackages: items.map((item, i) => ({
          attributes: {
            number: i + 1
          },

          // Weight must be minmum 0.1kg
          Weight:
            item.weight_gross > 0.1
              ? convert(item.weight_gross)
                  .from(item.weight_unit || "kg")
                  .to("kg")
              : 1,
          Dimensions: getDhlDimensions(item?.dimensions, 40),
          CustomerReferences:
            items.length > 1 ? `${reference}-${i + 1}` : reference
        }))
      },

      ShipTimestamp: getIsoDateTimeGmt(getWorkDay()) // to do , in final version we need to verify, must be a future date
    }
  };

  debug("dhl request label %j", req);
  const requestAt = new Date();
  const result = await shipmentRequest(settings, req);
  const responseAt = new Date();
  const dhlLogData = {
    shipmentId,
    requestAt,
    responseAt,
    request: req,
    response: { ...result, response: null }
  };

  if (result?.response) {
    // remove LabelImage from logging but should not modify the response data
    dhlLogData.response.response = { ...result?.response, LabelImage: null };
  }

  // :save to db
  // @ts-ignore: FIXME ts
  DhlConfirmLogging._collection.insert(dhlLogData);

  debug("dhl label response received %o", result?.response?.PackagesResult);

  if (!result?.response) {
    throw new Error("No response from DHL API");
  }

  if (
    result.response.Notification &&
    !result.response.ShipmentIdentificationNumber
  ) {
    debug("error %j", result.response.Notification);
    throw Error(JSON.stringify(result.response.Notification));
  }

  // test to see if the file is real
  if (process.env.DEBUG_DHL) {
    const graphicImage = Buffer.from(
      result.response.LabelImage.GraphicImage ||
        result.response.LabelImage[0].GraphicImage,
      "base64"
    );
    const fileName = `imports/api/shipmentPicking/services/DHL/testing/${new Date().getTime()}.pdf`;
    fs.writeFileSync(fileName, graphicImage);
  }
  const awsResult = await uploadFileToAws({
    base64data:
      result.response.LabelImage.GraphicImage ||
      result.response.LabelImage[0].GraphicImage,
    fileName: `${S3_FOLDER_NAME}/${S3_NAME_PREFIX}-${items[0]._id}.pdf`,
    filePath: undefined
  });

  // store: {<packingUnitId> : trackingNumber }
  const trackingNumbers = items.reduce((acc, cur, i) => {
    acc[cur.id] =
      (result.response.PackagesResult?.PackageResult || []).find(
        res => res.attributes?.number === `${i + 1}`
      )?.TrackingNumber || result.response.ShipmentIdentificationNumber;
    return acc;
  }, {});

  // result.response.PackagesResult?.PackageResult?.length
  //   ? result.response.PackagesResult?.PackageResult.reduce( (acc, cur) => {
  //     r.TrackingNumber})
  //   : result.response.ShipmentIdentificationNumber;
  debug("tracking numbers %o", trackingNumbers);
  debug("label url : %o", awsResult.url);
  const label: LabelType = {
    id: result.response.ShipmentIdentificationNumber,
    object_id: result.response.ShipmentIdentificationNumber, // required for cancelling
    labelUrl: awsResult.url,
    trackingNumbers,
    status: "created",
    costs: rate.charges, // costs should be mapped towards Transmate format as they will be set in the shipment
    carrierId: DHL_CARRIER_ID,
    createdAt: new Date()
  };
  return {
    label,
    trackingNumbers,
    rateRequest: req,
    operationType: "DHL-direct"
  };
};
