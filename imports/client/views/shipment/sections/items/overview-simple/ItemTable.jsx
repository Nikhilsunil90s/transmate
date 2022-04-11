import React from "react";
import { ReactTable } from "/imports/client/components/tables";
import { Icon, Popup } from "semantic-ui-react";
import get from "lodash.get";
import { Trans } from "react-i18next";

import { round } from "/imports/utils/UI/helpers";
import { ITEM_TYPE_ICONS } from "/imports/api/_jsonSchemas/enums/shipmentItems";

const convert = require("convert-units");

const debug = require("debug")("itemtable");

//#region components
const itemDescription = item => {
  if (get(item, "material.description")) {
    return get(item, "material.description");
  }
  if (get(item, ["description"])) {
    return get(item, ["description"]);
  }
  if (get(item, ["quantity", "description"])) {
    return get(item, ["quantity", "description"]);
  }
  if (get(item, ["number"])) {
    return item.number;
  }
  if (get(item, ["quantity", "code"])) {
    return get(item, ["quantity", "code"]);
  }

  return <Trans i18nKey="shipment.goods.defaultDescription" />;
};

const getTaxableKeys = (data = []) => {
  const taxableKeys = new Set();
  function addTaxable(taxable) {
    (taxable || []).forEach(({ type, quantity }) => quantity > 0 && taxableKeys.add(type));
  }
  data.forEach(item => {
    addTaxable(item.taxable);
    (item.subItems || []).forEach(subItem => addTaxable(subItem.taxable));
  });

  return [...taxableKeys];
};

const baseColumns = [
  {
    Header: () => null,
    accessor: "type",
    className: "collapsing",
    Cell: ({ value }) => <Icon name={ITEM_TYPE_ICONS[value] || "box"} />
  },
  {
    // description row
    Header: <Trans i18nKey="shipment.form.item.description" />,
    accessor: "_id",
    Cell: ({ row: { original } }) => itemDescription(original)
  },
  {
    // HS code
    Header: <Trans i18nKey="shipment.form.item.commodity" />,
    accessor: "commodity"
  },
  {
    // amount
    Header: <Trans i18nKey="shipment.form.item.quantity" />,
    accessor: "quantity",
    Cell: ({ value = {} }) => `${round(value.amount, 2).toLocaleString()} ${value.code}`
  },
  {
    Header: (
      <>
        <Trans i18nKey="shipment.form.item.weight_net" />{" "}
        <Trans i18nKey="shipment.form.item.weight_gross" />
      </>
    ),
    accessor: "weight_unit",
    Cell: ({ row: { original: item } }) => {
      const hasValue = !!item.weight_unit && !!item.weight_gross;
      return (
        <>
          {hasValue && (
            <>
              {item.weight_net && (
                <span style={{ opacity: 0.5 }}>( {item.weight_net.toLocaleString()} )</span>
              )}{" "}
              {item.weight_gross.toLocaleString()} {item.weight_unit}
            </>
          )}
          {!hasValue && " - "}
        </>
      );
    },
    Footer: ({ rows }) => {
      let unitError = "";
      const total = React.useMemo(
        () =>
          rows.reduce((sum, row) => {
            const weightUnit = get(row, "original.weight_unit");
            const qty = get(row, "original.weight_gross", 0);
            let kg = 0;
            if (qty && weightUnit) {
              try {
                kg = convert(qty)
                  .from(weightUnit)
                  .to("kg");
              } catch (e) {
                debug(e);
                unitError = "*";
              }
            }
            debug("reduce weight", { sum, row, qty, kg });
            return kg + sum;
          }, 0),
        [rows]
      );

      return `${round(total, 2).toLocaleString()} kg${unitError}`;
    }
  },
  {
    Header: () => null,
    accessor: "temperature",
    className: "collapsing",
    Cell: ({ row: { original: item } }) =>
      item.temperature && item.temperature.condition && item.temperature.condition !== "" ? (
        <Popup content={item.temperature.condition} trigger={<Icon name="thermometer quarter" />} />
      ) : null
  },
  {
    Header: () => null,
    accessor: "DG",
    className: "collapsing",
    Cell: ({ row: { original: item } }) =>
      item.DG ? (
        <Popup content="Dangerous goods" trigger={<Icon name="exclamation triangle" />} />
      ) : null
  }
];
//#endregion

const ItemTable = ({ items = [], isDataLoading, options = {}, onRowClick }) => {
  function handleClicked(selectedRow) {
    if (!selectedRow || !onRowClick) return;

    onRowClick(selectedRow);
  }

  const taxableKeys = getTaxableKeys(items);

  const mainTableColumns = [
    {
      Header: () => null,
      id: "expander",
      className: "collapsing",
      Cell: ({ row }) => {
        const { onClick, ...props } = row.getToggleRowExpandedProps();
        const toggle = e => {
          e.stopPropagation();
          onClick();
        };

        return get(row, ["original", "subItems", "length"]) > 0 ? (
          <span onClick={toggle} {...props}>
            {row.isExpanded ? <Icon name="caret down" /> : <Icon name="caret right" />}
          </span>
        ) : null;
      }
    },
    ...baseColumns
  ];

  // add column for each taxable key:
  if (!options.hideTaxable) {
    taxableKeys.forEach(key => {
      mainTableColumns.push({
        Header: `${key}`,
        id: key,
        accessor: "taxable",
        Cell: ({ value }) => {
          const tax = (value || []).find(({ type }) => type === key);
          return tax ? round(tax.quantity, 2) : " - ";
        },
        Footer: ({ rows }) => {
          const total = React.useMemo(
            () =>
              rows.reduce((sum, row) => {
                const tax =
                  (get(row, ["original", "taxable"]) || []).find(({ type }) => type === key) || {};
                return (tax.quantity || 0) + sum;
              }, 0),
            [rows]
          );

          return round(total, 2).toLocaleString();
        }
      });
    });
  }

  const renderRowSubComponent = React.useCallback(
    ({ row, colSpan }) => (
      <td colSpan={colSpan} style={{ paddingLeft: "4rem" }}>
        <ReactTable
          tableClass="ui blue table"
          TheadComponent={() => null}
          columns={baseColumns}
          data={get(row, ["original", "subItems"], [])}
          onRowClicked={handleClicked}
        />
      </td>
    ),
    []
  );

  // expand all by default:
  const expanded = {};
  (items || []).forEach((item, index) => {
    if (item.subItems && item.subItems.length > 0) {
      expanded[index] = true;
    }
  });

  return (
    <>
      <ReactTable
        isExpandable
        initialState={{ expanded }}
        renderRowSubComponent={renderRowSubComponent}
        isLoading={isDataLoading}
        columns={mainTableColumns}
        shouldShowTableFooter
        data={items}
        onRowClicked={handleClicked}
      />
    </>
  );
};

export default ItemTable;
