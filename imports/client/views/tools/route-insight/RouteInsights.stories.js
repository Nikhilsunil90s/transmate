import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import PageHolder from "/imports/client/components/utilities/PageHolder";

import ToolsRouteInsights from "./RouteInsights.jsx";
import ToolsRouteInsightResult from "./components/Results.jsx";

export default {
  title: "Tools/RouteInsight"
};

export const page = () => {
  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <PageHolder main="ToolsRouteInsight">
        <ToolsRouteInsights />
      </PageHolder>
    </MockedProvider>
  );
};

export const results = () => {
  const insight = {
    air: [
      {
        kg: "2000",
        steps: [
          {
            CO2: 26.128199999999996,
            cost: 48.9237262229572,
            days: 0.2104236111111111,
            from: {
              country: "BE"
            },
            hours: 5.050166666666667,
            km: 87.094,
            mode: "road",
            to: {
              country: "NL",
              locode: "NLEIN"
            },
            type: "groupage"
          },
          {
            CO2: 13808.970714074303,
            cost: 2040.2180154026948,
            days: 0.9205980476049536,
            from: {
              country: "NL",
              locode: "NLEIN"
            },
            hours: 9.137320317366356,
            km: 4602.990238024768,
            mode: "air",
            to: {
              country: "KZ",
              locode: "KZKGF"
            },
            type: "bulk"
          },
          {
            CO2: 347.1462,
            cost: 219.99432215537027,
            days: 2.314308,
            from: {
              country: "KZ",
              locode: "KZKGF"
            },
            hours: 5.050166666666667,
            km: 1157.154,
            mode: "road",
            to: {
              country: "US"
            },
            type: "groupage"
          }
        ],
        totalCO2: 14182.245114074301,
        totalCost: 2309.1360637810226,
        totalHours: 19.237653650699688,
        totalKm: 5847.238238024767,
        totalLeadtime: 4,
        warnings: []
      }
    ],
    road: [
      {
        steps: [
          {
            CO2: 2060.6367,
            days: 8.080928235294117,
            durationHours: 114.17805555555556,
            from: {
              country: "BE",
              countryCode: "BE",
              lat: 51.2166666666667,
              lng: 4.41666666666667
            },
            hours: 114.17805555555556,
            km: 6868.789,
            mode: "road",
            to: {
              country: "US",
              countryCode: "US",
              lat: 43.31666666666667,
              lng: 78.38333333333334
            },
            type: "FTL"
          }
        ],
        totalCO2: 2060.6367,
        totalCost: 983.0419459999998,
        totalHours: 114.17805555555556,
        totalKm: 6868.789,
        totalLeadtime: 9
      }
    ],
    sea: [
      {
        kg: "2000",
        steps: [
          {
            CO2: 0,
            cost: 35,
            days: null,
            from: {
              country: "BE"
            },
            km: 0,
            mode: "road",
            to: {
              country: "BE",
              locode: "BEANR"
            },
            type: "groupage"
          },
          {
            CO2: 575.3238,
            cost: 318.4103616,
            days: 38.35492,
            from: {
              country: "BE",
              locode: "BEANR"
            },
            hours: 480,
            km: 11506.476,
            mode: "sea",
            to: {
              country: "PK",
              locode: "PKKHI"
            },
            type: "grouppage"
          },
          {
            CO2: 1057.2282,
            cost: 598.397249408296,
            days: null,
            from: {
              country: "PK",
              locode: "PKKHI"
            },
            hours: null,
            km: 3524.094,
            mode: "road",
            to: {
              country: "US"
            },
            type: "groupage"
          }
        ],
        totalCO2: 1632.5520000000001,
        totalCost: 951.807611008296,
        totalHours: null,
        totalKm: 15030.57,
        totalLeadtime: null,
        warnings: []
      }
    ]
  };
  return (
    <PageHolder main="ToolsRouteInsight">
      <ToolsRouteInsightResult insight={insight} />
    </PageHolder>
  );
};
