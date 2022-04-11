import React from "react";
import { Icon } from "semantic-ui-react";

// import { useTranslation, Trans } from "react-i18next";

import { ReactTable } from "/imports/client/components/tables";
import get from "lodash.get";
import { useQuery } from "@apollo/client";
import { currencyFormat } from "/imports/utils/UI/helpers";

import { GET_SHIPMENT_BY_ID_MINIMAL } from "../utils/queries";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

const debug = require("debug")("price-request:analyticsdata");

// to do heatmap generate
// function getMinMax(array, key) {
//   const min = Math.min(...array.map(el => el[key]);
//   const min = Math.max(...array.map(el => el[key]);
//   return [min, max];
// }

export const AnalyticsData = ({ priceRequest = {} }) => {
  debug("load analytics for ");
  const data = get(priceRequest, "analyseData", []).map((row, index) => {
    const { totalCostEur, km, kg } = row || {};
    const kgCost = (totalCostEur && kg && (totalCostEur / kg).toFixed(3)) || null;
    const kmCost = (totalCostEur && km && (totalCostEur / km).toFixed(3)) || null;
    const eurPerKmPerKg =
      (totalCostEur && km && kg && ((totalCostEur / km / kg) * 1000000).toFixed(0)) || null;
    return { ...row, eurPerKmPerKg, kgCost, kmCost, key: index };
  });
  const currency = get(priceRequest, "currency", "EUR");

  const columns = [
    {
      Header: "ref",
      accessor: "shipmentId",
      sortable: true,

      Cell({ row: { original = {} } }) {
        const { data: shipmentData = {}, error } = useQuery(GET_SHIPMENT_BY_ID_MINIMAL, {
          variables: { shipmentId: original.shipmentId },
          fetchPolicy: "cache-and-network"
        });
        if (error) debug("apollo returns error on GET_SHIPMENT_BY_ID_MINIMAL %o", { error });
        const { shipment } = shipmentData;

        return (
          <a
            href={generateRoutePath("shipment", { _id: original.shipmentId })}
            rel="noreferrer"
            target="_blank"
          >
            {get(shipment, "references.number") || get(shipment, "number", original.shipmentId)}
          </a>
        );
      }
    },
    {
      Header: "carrier",
      accessor: "carrierName",
      sortable: true,
      filter: "text"
    },
    {
      Header: "",
      accessor: "shipmentType",
      sortable: true,
      Cell({ row: { original = {} } }) {
        switch (get(original, "shipmentType", "")) {
          case "road":
            return <Icon name="truck" />;
          case "rail":
            return <Icon name="train" />;
          case "sea":
          case "ocean":
            return <Icon name="ship" />;
          case "air":
            return <Icon name="plane" />;
          default:
            return get(original, "shipmentType", "");
        }
      }
    },

    {
      Header: "type",
      accessor: "type",
      sortable: true
    },
    {
      Header: "kg",
      accessor: "kg",
      sortable: true,
      Cell: ({ row: { original = {} } }) => {
        return (original.kg && original.kg.toFixed(0)) || null;
      }
    },
    {
      Header: "km",
      accessor: "km",
      sortable: true,
      Cell: ({ row: { original = {} } }) => {
        return (original.km && original.km.toFixed(0)) || null;
      }
    },
    {
      Header: "EUR",
      accessor: "totalCostEur",
      sortable: true,
      Cell: ({ row: { original = {} } }) => {
        return (
          (original.totalCostEur &&
            ((original || {}).type === "simulation" ? "±" : "") +
              currencyFormat(original.totalCostEur, currency)) ||
          null
        );
      }
    },
    {
      Header: "€/kg",
      accessor: "kgCost",
      sortable: true
    },
    {
      Header: "€/km",
      accessor: "kmCost",
      sortable: true
    },
    {
      Header: "€/km/kg(x10⁶)",
      accessor: "eurPerKmPerKg",
      sortable: true
    }
  ];
  const initialState = {
    sortBy: [
      {
        id: "shipmentId",
        desc: false
      }
    ]
  };
  return (
    <>
      <h3 className="section-header">ANALYSE DATA</h3>
      <ReactTable columns={columns} data={data} initialState={initialState} />
    </>
  );
};
