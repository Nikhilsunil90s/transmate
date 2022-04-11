import moment from "moment";

import { GET_PRICELIST_DATA } from "/imports/client/components/tags/PriceListTag";
import { GET_OWN_PRICELISTS_QUERY } from "/imports/client/components/forms/uniforms/SelectPriceListField.tsx";

export const dummyProps = {
  tenderBidId: "KNP26e3iQNRohj7zi",
  tenderBid: {
    id: "KNP26e3iQNRohj7zi",
    partner: {
      id: "S89952",
      name: "dummy-customer",
      management: {
        segment: "tier 1"
      }
    },
    offer: {
      latest: {
        version: 6,
        ts: new Date("2020-03-17T10:51:29.293+01:00"),
        validFrom: new Date("2020-03-17T00:00:00.000+01:00"),
        validTo: new Date("2021-03-17T00:00:00.000+01:00"),
        file: {
          ETag: "e23dd7cd65cb71be41f4220f00243b51",
          Location:
            "https://s3.eu-central-1.amazonaws.com/files.transmate.eu/documents/tenderify/output/1584438690308_tmp-7Iwl2PVNaaTTq.xlsx",
          key:
            "documents/tenderify/output/1584438690308_tmp-7Iwl2PVNaaTTq.xlsx",
          Key:
            "documents/tenderify/output/1584438690308_tmp-7Iwl2PVNaaTTq.xlsx",
          Bucket: "files.transmate.eu"
        }
      }
    },
    tender: {
      dueDate: moment()
        .startOf("day")
        .add(10, "days")
        .toDate(),
      volume: 150000,
      volumeUOM: "pal",
      revenue: { value: 1500000, currency: "EUR" }
    },
    bidControl: {
      priceLists: ["ubsaP26AabfkyTKLc"],
      itemCount: 10,
      offeredCount: 6,
      emptyCount: 4,
      errors: []
    }
  }
};

export const priceListQueryMock = [
  {
    request: {
      query: GET_PRICELIST_DATA,
      variables: { priceListId: "ubsaP26AabfkyTKLc" }
    },
    result: {
      data: {
        priceList: {
          id: "priceListId",
          title: "Linked rate card",
          status: "active"
        }
      }
    }
  }
];

export const priceListSelectMock = [
  {
    request: {
      query: GET_OWN_PRICELISTS_QUERY,
      variables: { input: { type: "contract" } }
    },
    result: {
      data: {
        priceLists: [
          {
            id: "someId",
            title: "demo pricelist",
            carrierName: "Partner",
            type: "contract",
            status: "active"
          }
        ]
      }
    }
  }
];

// export const link = new WildcardMockLink([priceListQueryMock]);
