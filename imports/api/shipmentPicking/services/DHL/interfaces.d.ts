interface TrackingNumbersMap {
  [k: string]: string;
}

type statusType = "created";
export interface LabelType {
  id?: string;
  object_id?: string;
  labelUrl: string;
  trackingNumbers?: TrackingNumbersMap;
  status: statusType;
  costs?: Array<Object>;
  carrierId: string;
  createdAt: Date;
}

export interface ShipLocation {
  countryCode: string;
  zipCode: string;
  address: {
    street: string;
    address1?: String;
    address2?: String;
    number: string;
    city: string;
  };
  name?: string;
  companyName?: string;
  phoneNumber?: string;
  email?: string;
}

export interface SettingsType {
  defaults: {
    DropOffType?: string;
    Currency: string;
    UnitOfMeasurement: string;
    PersonName: string;
    CompanyName: string;
    PhoneNumber: string;
    EmailAddress: string;
  };
  sandbox?: boolean;
  accountNumber: string;
  domesticCountries?: Array<string>;
}
