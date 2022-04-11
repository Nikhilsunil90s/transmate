import React from "react";
import { Trans } from "react-i18next";
import { Icon, Popup } from "semantic-ui-react";

interface stopProp {
  location: Object;
  date: number | Date;
  datePlanned: number | Date;
  dateScheduled: number | Date;
  dateActual: number | Date;
}

const ShipmentDateTableCell = ({ stop }: { stop: stopProp }) => {
  const { datePlanned, dateActual, dateScheduled } = stop;
  let icon;
  let popup;

  switch (true) {
    case !!dateActual && dateActual > datePlanned:
      popup = <Trans i18nKey="projects.table.dates.actualLate" />;
      icon = { name: "warning", color: "red" };
      break;
    case !!dateActual && dateActual <= datePlanned:
      popup = <Trans i18nKey="projects.table.dates.actualOK" />;
      icon = { name: "check", color: "green" };
      break;
    case !!dateScheduled && dateScheduled < new Date():
      popup = <Trans i18nKey="projects.table.dates.scheduledLate" />;
      icon = { name: "warning", color: "red" };
      break;
    case !!datePlanned && datePlanned < new Date():
      popup = <Trans i18nKey="projects.table.dates.plannedLate" />;
      icon = { name: "warning", color: "red" };
      break;
    case !!datePlanned:
      popup = <Trans i18nKey="projects.table.dates.planned" />;
      icon = { name: "calendar", color: "blue" };
      break;
    default:
      popup = <Trans i18nKey="projects.table.dates.requested" />;
      icon = { name: "circle outline" };
      break;
  }

  return <Popup content={popup} trigger={<Icon {...icon} />} />;
};

export default ShipmentDateTableCell;
