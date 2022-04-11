/* eslint-disable no-underscore-dangle */
import React from "react";
import get from "lodash.get";
import moment from "moment";
import { Trans } from "react-i18next";
import { Popup } from "semantic-ui-react";
import {
  ShipmentFlagTag,
  ShipmentModeTag,
  ShipmentProjectTag,
  ShipmentPriceRequestTag,
  CountryFlag,
  ItemEquipmentRefTag
} from "/imports/client/components/tags";
import { currencyFormat } from "/imports/utils/UI/helpers";

const debug = require("debug")("template-shipments-table");

debug("arrived in shipments table view");

const dateColumns = s => {
  const columns = {};
  ["arrival", "start", "end", "documents", "departure"].forEach(m => {
    return ["planned", "scheduled", "actual"].forEach(t => {
      const dateTitle = <Trans i18nKey={`shipment.${s}.date`} />;
      const dateFull = (
        <Trans
          i18nKey="shipment.date.assembled"
          planned={<Trans i18nKey={`shipment.date.parts.${t}`} />}
          pickup={<Trans i18nKey={`shipment.date.parts.${s}`} />}
          arrival={<Trans i18nKey={`shipment.date.parts.${m}`} />}
        />
      );

      columns[`${s}-${m}-${t}`] = {
        Header: `shipment.date.parts.${s}`,
        HeaderRender: (
          <Popup
            content={`${dateFull} date`}
            position="bottom center"
            className="tip"
            trigger={<span>{dateTitle}</span>}
          />
        ),
        dateParts: {
          t,
          s,
          m
        },
        style: { whiteSpace: "nowrap" },
        Cell({ row: { original: data = {} } }) {
          const date = get(data, ["dates", `${s}-${m}-${t}`, "value"]);
          return moment(date).format("DD MMM YY");
        }
      };
    });
  });
  return columns;
};

export const ShipmentsTable = {
  columns: {
    shipment: {
      mode: {
        label: "shipment.mode",
        Cell({ row: { original: data = {} } }) {
          return <ShipmentModeTag mode={get(data, ["shipment", "mode"])} />;
        }
      },
      number: {
        label: "shipment.number"
      },
      status: {
        label: "shipment.status",
        Cell({ row: { original: data = {} } }) {
          if (get(data, ["shipment", "edi", "error"])) {
            return <span className="error-text">{data.edi.error}</span>;
          }
          return get(data, ["shipment", "status"], null);
        }
      },
      drivers: {
        label: "shipment.drivers",
        HeaderRender: (
          <Popup
            content={<Trans i18nKey="shipment.drivers" />}
            position="bottom center"
            className="tip"
            trigger={<span>A.</span>}
          />
        ),
        Cell() {
          return "";
        }
      },
      flags: {
        label: "shipment.flags",
        Cell({ row: { original: data = {} } }) {
          if (!Array.isArray(get(data, ["shipment", "flags"]))) {
            return null;
          }
          return get(data, ["shipment", "flags"], [])
            .filter(flag => flag !== "")
            .map((flag, i) => <ShipmentFlagTag key={i} flag={flag} />);
        }
      },
      hasProject: {
        label: "shipment.project.filter",
        HeaderRender: (
          <Popup
            content={<Trans i18nKey="shipment.project.filter" />}
            position="bottom center"
            className="tip"
            trigger={<span>P</span>}
          />
        ),
        Cell({ row: { original: data = {} } }) {
          return <ShipmentProjectTag hasProject={get(data, ["shipment", "hasProject"])} />;
        }
      },
      hasPriceRequest: {
        label: "shipment.hasPriceRequest.filter",
        HeaderRender: (
          <Popup
            content={<Trans i18nKey="shipment.hasPriceRequest.filter" />}
            position="bottom center"
            className="tip"
            trigger={<span>R</span>}
          />
        ),
        Cell({ row: { original: data = {} } }) {
          return (
            <ShipmentPriceRequestTag hasPriceRequest={get(data, ["shipment", "hasPriceRequest"])} />
          );
        }
      }
    },
    item: {
      // plate number & container number of first item
      itemReference: {
        label: "item.itemReference",
        accessor: "item.itemReference", // returns {}
        Cell({ value }) {
          return <ItemEquipmentRefTag references={value} />;
        }
      }
    },
    locations: {
      pickup: {
        Header: "shipment.pickup.location",
        accessor: "locations.pickup.location"
      },
      delivery: {
        Header: "shipment.delivery.location",
        accessor: "locations.delivery.location"
      }
    },
    partners: {
      shipper: {
        Header: "shipment.shipper",
        accessor: "partners.shipper"
      },
      consignee: {
        Header: "shipment.consignee",
        accessor: "partners.consignee"
      },
      carriers: {
        Header: "shipment.carriers",
        accessor: "partners.carriers"
      }
    },

    projects: {
      title: { label: "projects.title" }
    },
    entities: {
      email: {
        Header: "shipment.entities.email.header",
        HeaderRender: (
          <Popup
            content={<Trans i18nKey="shipment.entities.email.popup" />}
            position="bottom center"
            className="tip"
            trigger={
              <span>
                <Trans i18nKey="shipment.entities.email.header" />
              </span>
            }
          />
        ),
        label: "shipment.entities.email.label"
      },
      code: {
        Header: "shipment.entities.code.header",
        HeaderRender: (
          <Popup
            content={<Trans i18nKey="shipment.entities.code.popup" />}
            position="bottom center"
            className="tip"
            trigger={
              <span>
                <Trans i18nKey="shipment.entities.code.header" />
              </span>
            }
          />
        ),
        label: "shipment.entities.code.label"
      },
      country: {
        Header: "shipment.entities.country.header",
        HeaderRender: (
          <Popup
            content={<Trans i18nKey="shipment.entities.country.popup" />}
            position="bottom center"
            className="tip"
            trigger={
              <span>
                <Trans i18nKey="shipment.entities.country.header" />
              </span>
            }
          />
        ),
        label: "shipment.entities.country.label",
        Cell: ({ value }) => (value ? <CountryFlag countryCode={value} /> : "")
      }
    },
    references: {
      number: {
        Header: "shipment.references.number"
      },
      carrier: {
        Header: "shipment.references.carrier"
      },
      consignee: {
        Header: "shipment.references.consignee"
      }
    },
    costs: {
      total: {
        Header: "shipment.costs.title_short",
        Cell({ row: { original: data = {} } }) {
          const currency = get(data, "shipment.costs.currency", "EUR");
          const value = get(data, "shipment.costs.total");
          const result = currencyFormat(Number(value), currency);

          debug("shipment.costs", { currency, value, result });
          if (value) return result;
          return "";
        }
      },
      count: {
        label: "shipment.costs.count",
        Header: "shipment.costs.count_short"
      },
      delta: {
        Header: "shipment.costs.delta",
        Cell({ row: { original: data = {} } }) {
          const currency = get(data, ["shipment", "costs", "currency"], "EUR");
          return currencyFormat(get(data, ["shipment", "costs", "delta"]), currency);
        }
      }
    },
    invoices: {
      total: {
        label: "shipment.invoices.title",
        Header: "shipment.invoices.title_short",
        Cell({ row: { original: data = {} } }) {
          const currency = get(data, ["invoices", "costs", "currency"], "EUR");
          return currencyFormat(get(data[("invoices", "costs", "total")]), currency);
        }
      },
      items: {
        label: "shipment.invoices.count",
        Header: "shipment.invoices.count_short"
      },
      number: {
        label: "shipment.invoices.number",
        Header: "shipment.invoices.number_short"
      },
      status: {
        label: "shipment.invoices.status",
        Header: "shipment.invoices.status_short"
      }
    },
    dates: {
      created: {
        Header: "shipment.created._",
        accessor: "dates.created",
        style: { whiteSpace: "nowrap" },
        Cell({ row: { original: data = {} } }) {
          const date = get(data, ["dates", "created", "value"]);
          return moment(date).format("DD MMM YY");
        }
      },
      ...dateColumns("pickup"),
      ...dateColumns("delivery")
    }
  }
};
