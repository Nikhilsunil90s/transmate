import React from "react";
import { Trans, useTranslation } from "react-i18next";
import get from "lodash.get";

import { Header, Checkbox } from "semantic-ui-react";

import { ShipmentsTable } from "../../table";

const DATE_COLUMNS_TO_SHOW = [
  "delivery-arrival-planned",
  "delivery-arrival-scheduled",
  "pickup-arrival-planned",
  "pickup-arrival-scheduled",
  "updated",
  "created"
];

const groups = Object.keys(ShipmentsTable.columns);
const columnsForGroup = group =>
  Object.keys(ShipmentsTable.columns[group]).filter(
    column => group !== "dates" || DATE_COLUMNS_TO_SHOW.includes(column)
  );

const FieldsColumn = ({ state, updateState }) => {
  const { t } = useTranslation();
  const { columns = [] } = state;
  function columnTitle(group, column) {
    if (column.indexOf("-") > -1) {
      const [s, m, tt] = column.replace("column.dates.", "").split("-");
      return t("shipment.date.assembled", {
        planned: t(`shipment.date.parts.${tt}`),
        pickup: t(`shipment.date.parts.${s}`),
        arrival: t(`shipment.date.parts.${m}`)
      });
    }
    const tKey =
      get(ShipmentsTable.columns, [group, column, "label"]) ||
      get(ShipmentsTable.columns, [group, column, "Header"]) ||
      `shipment.${column}`;
    return t(tKey);
  }
  function toggleColumn({ name, checked }) {
    if (checked) {
      updateState({
        columns: columns.concat([name])
      });
    } else {
      const newCols = columns.filter(x => x !== name);
      updateState({
        columns: newCols
      });
    }
  }

  return (
    <>
      <Header dividing content={<Trans i18nKey="shipments.view.columns" />} />
      {groups.map(group => (
        <React.Fragment key={group}>
          <Header
            content={<Trans i18nKey={`shipments.view.column.group.${group}`} />}
            className={`group ${group}`}
          />
          {columnsForGroup(group).map((column, i) => (
            <div key={i}>
              <Checkbox
                label={columnTitle(group, column)}
                checked={columns.includes(`${group}.${column}`)}
                onChange={(_, { checked }) => toggleColumn({ name: `${group}.${column}`, checked })}
              />
            </div>
          ))}
        </React.Fragment>
      ))}
    </>
  );
};

export default FieldsColumn;
