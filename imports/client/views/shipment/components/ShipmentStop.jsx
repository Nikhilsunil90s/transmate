import React, { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import get from "lodash.get";
import PropTypes from "prop-types";
import classNames from "classnames";
import { List, Icon, Form } from "semantic-ui-react";
import { DateTimeTZtoggleTag } from "/imports/client/components/tags";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import { dateTimeComboField as DateTimeComboField } from "/imports/client/components/forms/uniforms/DateInput";
import { useApolloClient } from "@apollo/client";

import { UPDATE_SHIPMENT_ASIDE } from "../utils/queries";

const debug = require("debug")("shipment:aside");

const ChangeDateModal = ({ show, showModal, date, label, onSaveDate }) => {
  const [state, setState] = useState({ date });

  function submitForm() {
    onSaveDate({ ...state });
  }

  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title="Modify Date"
      body={
        <Form>
          <DateTimeComboField
            label={label}
            value={state.date}
            onChange={newDate => setState({ ...state, date: newDate })}
          />
        </Form>
      }
      actions={<ModalActions {...{ showModal, onSave: submitForm }} />}
    />
  );
};

function getDate(stop, shipment) {
  return get(shipment, [stop, "date"]);
}

function checkedMS(stop, shipment) {
  return stop === "pickup"
    ? ["started", "partial", "completed"].includes(shipment.status)
    : shipment.status === "completed";
}
function formatLocation(stop, shipment) {
  const l = get(shipment, [stop, "location"]) || {};
  debug("formatLocation %o", { shipment, stop, l });
  if (l.name) return l.annotation?.name || l.name;
  if (l.zipCode) return `${l.countryCode}-${l.zipCode}`;
  return "";
}

// used in Aside:
const ShipmentStop = ({ shipment, stop, canEdit }) => {
  const { t } = useTranslation();
  const [show, showModal] = useState(false);
  const client = useApolloClient();

  const checked = checkedMS(stop, shipment);
  const locationFormatted = formatLocation(stop, shipment);
  const locationTZ = get(shipment, [stop, "location", "timeZone"]);
  const date = getDate(stop, shipment);
  debug("shipment stop %o", { checked, locationFormatted, date });

  function onChangeDate({ date: newDate }) {
    if (!newDate || !shipment || !stop) return;
    client
      .mutate({
        mutation: UPDATE_SHIPMENT_ASIDE,
        variables: {
          shipmentId: shipment.id,
          updates: { [`${stop}.date`]: newDate }
        }
      })
      .then(({ errors }) => {
        if (errors) throw errors;
        toast.success("Date modified");
        showModal(false);
      })
      .catch(error => {
        console.error({ error });
        toast.error("Could not save dates");
      });
  }

  return (
    <div className={classNames("stop", { checked })}>
      {checked ? (
        <Icon circular inverted color="blue" name="check" />
      ) : (
        <Icon circular color="blue" />
      )}
      <List>
        <List.Item>
          <Icon color="grey" name="map marker alternate" />
          <List.Content>{locationFormatted}</List.Content>
        </List.Item>
        <List.Item>
          <Icon color="grey" name="calendar alternate outline" />
          <List.Content>
            <div
              className={classNames("relative", { editable: canEdit })}
              style={{ position: "relative" }}
            >
              <DateTimeTZtoggleTag date={date} locationTZ={locationTZ} />
              <div className="float top right" style={{ visibility: "hidden" }}>
                <Icon color="grey" name="pencil" onClick={() => showModal(true)} />
              </div>
            </div>
          </List.Content>
        </List.Item>
      </List>
      <ChangeDateModal
        {...{ show, showModal, date, label: t(`shipment.tooltip.date.${stop}`) }}
        onSaveDate={onChangeDate}
      />
    </div>
  );
};

ShipmentStop.propTypes = {
  shipment: PropTypes.object.isRequired,
  stop: PropTypes.oneOf(["pickup", "delivery"]).isRequired,
  canEdit: PropTypes.bool
};

export default ShipmentStop;
