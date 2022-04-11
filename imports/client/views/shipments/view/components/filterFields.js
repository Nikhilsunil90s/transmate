import React from "react";
import { Flag } from "semantic-ui-react";
import { STATUS } from "/imports/api/_jsonSchemas/enums/shipment";
import { GET_ENTITIES, GET_ACTIVE_PROJECTS } from "../utils/queries";

export const getFilterOptions = t => [
  //#region flags
  {
    name: "planner-me",
    type: "flag",
    label: t("shipment.flag.planner-me")
  },
  {
    name: "approve-costs",
    type: "flag",
    label: t("shipment.flag.approve-costs")
  },
  {
    name: "tracking",
    type: "flag",
    label: t("shipment.flag.tracking")
  },
  {
    name: "tracking-failed",
    type: "flag",
    label: t("shipment.flag.tracking-failed")
  },
  {
    name: "eta-late",
    type: "flag",
    label: t("shipment.flag.eta-late")
  },
  {
    name: "late",
    type: "flag",
    label: t("shipment.flag.late")
  },
  {
    name: "has-costs",
    type: "flag",
    label: t("shipment.flag.has-costs")
  },
  {
    name: "has-invoice",
    type: "flag",
    label: t("shipment.flag.has-invoice")
  },
  {
    name: "project",
    type: "flag",
    label: t("shipment.project.filter")
  },
  {
    name: "hasPriceRequest",
    type: "flag",
    label: t("shipment.project.filter")
  },
  //#endregion
  //#region fixed values
  {
    name: "status",
    type: "fixed",
    label: t("shipment.status"),
    allowedValues: STATUS
  },
  {
    name: "drivers",
    type: "fixed",
    label: t("shipment.drivers"),
    allowedValues: ["none", "partial", "allocated"]
  },
  {
    name: "entities",
    type: "fixed",
    label: t("shipment.entities.filter"),
    query: GET_ENTITIES,
    queryKey: "entities",
    transformOptions: ({ code, name, country }) => ({
      value: code,
      text: name,
      content: (
        <>
          {country && <Flag name={country.toLowerCase()} />}
          <b>{code}</b>
          {name}
        </>
      )
    })
  },
  {
    name: "projectIn",
    type: "fixed",
    label: t("shipment.project.filterIn"),
    query: GET_ACTIVE_PROJECTS,
    transformOptions: ({ id, title, year, type }) => ({
      value: id,
      text: title,
      content: (
        <>
          <b>{title}</b>({year})
          <span style={{ opacity: 0.5 }}>
            {type?.group} - {type?.code}
          </span>
        </>
      )
    })
  },
  {
    name: "projectOut",
    type: "fixed",
    label: t("shipment.project.filterOut"),
    query: GET_ACTIVE_PROJECTS,
    transformOptions: ({ id, title, year, type }) => ({
      value: id,
      text: title,
      content: (
        <>
          <b>{title}</b>({year})
          <span style={{ opacity: 0.5 }}>
            {type?.group} - {type?.code}
          </span>
        </>
      )
    })
  },
  //#endregion
  //#region input
  {
    name: "deltaLargerThan",
    type: "input",
    label: t("shipment.costs.delta_gte")
  },
  //#endregion
  //#region location
  {
    name: "pickup",
    type: "location",
    label: t("shipment.pickup.location")
  },
  {
    name: "delivery",
    type: "location",
    label: t("shipment.delivery.location")
  },
  //#endregion
  //#region partner
  {
    name: "shipper",
    type: "partner",
    label: t("shipment.shipper")
  },
  {
    name: "carrier",
    type: "partner",
    label: t("shipment.carrier")
  },
  {
    name: "consignee",
    type: "partner",
    label: t("shipment.consignee")
  },
  // //#endregion
  ...["pickup", "delivery"].map(s => ({
    name: `${s}-arrival-planned`,
    type: "period",
    label: t("shipment.date.assembled", {
      planned: t("shipment.date.parts.planned"),
      pickup: t(`shipment.date.parts.${s}`),
      arrival: t("shipment.date.parts.arrival")
    }),
    defaultValue: { period: "+d" }
  }))
];

// .concat(
//   (() => {
//     // Date fields (pickup.arrival.planned, delivery.departure.actual etc)
//     const fields = [];
//     ["pickup", "delivery"].forEach(s => {
//       return ["arrival"].forEach(
//         m => {
//           return ["planned"].forEach(t => {
//             return fields.push({
//               name: `${s}-${m}-${t}`,
//               type: "period",
//               label: oldTAPi18n.__("shipment.date.assembled", {
//                 planned: <Trans i18nKey={`shipment.date.parts.${t}`} />,
//                 pickup: <Trans i18nKey={`shipment.date.parts.${s}`).toLowerCase(} />,
//                 arrival: <Trans i18nKey={`shipment.date.parts.${m}`).toLowerCase(} />
//               })
//             });
//           });
//         }
//       );
//     });
//     return fields;
//   })()
// );
