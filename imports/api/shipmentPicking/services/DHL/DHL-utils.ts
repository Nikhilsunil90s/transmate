import get from "lodash.get";
import { SettingsType, ShipLocation } from "./interfaces";

const debug = require("debug")("dhl:utils");
const convert = require("convert-units");

// domestic = inside eu
const DOMESTIC_COUNTRIES = [
  "AT",
  "BE",
  "BG",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "GR",
  "HR",
  "HU",
  "IE",
  "IT",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SE",
  "SI",
  "SK"
];

export const DEFAULT_OPTION_VALUE = {
  // rateId: String!
  // amount: Float
  // currency: String
  // amountLocal: Float
  // currencyLocal: String

  providerImage75: "https://files.transmate.eu/logos/picking/DHL_logo_rgb.png",
  providerImage200: "https://files.transmate.eu/logos/picking/DHL_logo_rgb.png",

  // servicelevel: PickingLabelOptionServiceLevel
  // days: Float
  // arrivesBy: Date
  // durationTerms: String
  // messages: [String]
  // carrierAccount: String
  // test: Boolean
  // zone: String

  provider: "DHL",
  serviceLevel: {
    name: "Economy"
  },

  // Transmate:
  accountId: "C123456"
};

export const SERVICE_MAP = {
  C: {
    name: "Express Courrier"
  },
  K: {
    name: "DOM Express 9:00"
  },
  O: {
    name: "DOM Express 10:30"
  },
  1: {
    name: "DOM Express 12:00"
  },
  D: {
    name: "EXPRESS Worldwide Doc"
  },
  U: {
    name: "EXPRESS Worldwide EU"
  },
  T: {
    name: "EXPRESS 12:00 doc"
  },

  // K: {
  //   name: "EXPRESS 09:00 doc"
  // },
  E: {
    name: "EXPRESS 09:00 nondoc"
  },
  Y: {
    name: "EXPRESS 12:00 nondoc"
  },
  P: {
    name: "EXPRESS Worldwide nondoc"
  },
  N: {
    name: "DOMESTIC EXPRESS"
  }
};

export const COST_TYPE_MAP = {
  base: "o6fLThAWhaWW3uDaj",
  FF: "rFRy3NwqyhaWwqJuJ", // fuel surcharge
  CR: "Swqu9Pnh4ypZFTXeL",
  unmapped: "JpKrR3PggDfp8dnNP"
};

export const getWorkDay = (daysInFuture = 0): Date => {
  debug("add 1 minute to shipping time");
  const d = new Date(new Date().setTime(new Date().getTime() + 1000 * 60));
  d.setDate(d.getDate() + daysInFuture); // today
  let hour = 9; // default ship at 9h
  if (d.getDay() === 0) {
    d.setDate(d.getDate() + 1);
  } else if (d.getDay() === 6) {
    d.setDate(d.getDate() + 2);
  } else {
    hour = d.getHours() + 1;
  }
  d.setHours(hour, 0, 0, 0);
  return d;
};

export const getDhlDimensions = (
  dimensions: { length?: number; width?: number; height?: number },
  defaultSize = 0
): { Length: number; Width: number; Height: number } => {
  const uom = get(dimensions, "uom") || "cm";
  return {
    Length: convert(get(dimensions, "length", defaultSize))
      .from(uom)
      .to("cm"),
    Width: convert(get(dimensions, "width", defaultSize))
      .from(uom)
      .to("cm"),
    Height: convert(get(dimensions, "height", defaultSize))
      .from(uom)
      .to("cm")
  };
};
export const DHL_CARRIER_ID = "C00001";

export function determineDHLContentType(
  fromCC: string,
  toCC: string,
  settings: SettingsType
) {
  const domesticCountries = settings.domesticCountries || DOMESTIC_COUNTRIES;
  switch (true) {
    case fromCC === toCC:
      return "DOCUMENTS";
    case domesticCountries.includes(fromCC) && domesticCountries.includes(toCC):
      return "DOCUMENTS";
    default:
      return "NON_DOCUMENTS";
  }
}

export function getDhlAddressDefinition(location: ShipLocation) {
  return {
    StreetLines: location.address.street.substring(0, 35),
    ...(location.address.number
      ? { StreetNumber: location.address.number }
      : {}),
    ...(location.address.address1
      ? { StreetLines2: location.address.address1 }
      : {}),
    ...(location.address.address2
      ? { StreetLines3: location.address.address2 }
      : {}),
    City: location.address.city.substring(0, 35),
    PostalCode: location.zipCode.substring(0, 12),
    CountryCode: location.countryCode
  };
}

export function getDhlContactDefinition(location: ShipLocation) {
  return {
    PersonName: (location.name || "").substring(0, 45),
    CompanyName: (location.companyName || location.name || "").substring(0, 60), // if it is being sent
    PhoneNumber: (location.phoneNumber || "NA").substring(0, 35), // to do
    ...(location.email?.length
      ? { EmailAddress: location.email.substring(0, 50) }
      : {})
  };
}
