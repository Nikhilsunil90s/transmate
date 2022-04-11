import { toast } from "react-toastify";
import React, { useState } from "react";
import { useApolloClient } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";
import dot from "dot-object";
import { Grid, Icon, Popup, Table } from "semantic-ui-react";
import PropTypes from "prop-types";

import { DateTimeComboWithTZ } from "/imports/client/components/forms/uniforms/DateInput.jsx";
import { UPDATE_STAGE } from "../utils/queries";

const StageDate = ({ i18nKey, iconName, date, locationTimeZone }) => {
  return (
    <Table.Row>
      <Table.Cell
        collapsing
        content={<Popup content={<Trans i18nKey={i18nKey} />} trigger={<Icon name={iconName} />} />}
      />
      <Table.Cell>
        {date ? (
          <DateTimeComboWithTZ
            value={new Date(date)}
            disabled
            onChange={() => {}}
            locationTimeZone={locationTimeZone}
          />
        ) : (
          <Trans i18nKey="shipment.date.notSet" />
        )}
      </Table.Cell>
    </Table.Row>
  );
};

const PlannedDate = ({ ...props }) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const { canEdit, stop, value: orgVal, stageId, locationTimeZone } = props;
  const [value, setValue] = useState(orgVal);
  const onChangeDate = newDate => {
    if (!canEdit) return;
    setValue(newDate);
    if (newDate < new Date()) {
      toast.warning(t("shipment.stage.date.past"));
    }
    client
      .mutate({
        mutation: UPDATE_STAGE,
        variables: {
          input: {
            stageId,
            updates: dot.object({ [`dates.${stop}.arrival.planned`]: newDate })
          }
        }
      })
      .then(({ errors }) => {
        if (errors) throw errors;
        toast.success("Date modified");
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not save date");
      });
  };

  return (
    <DateTimeComboWithTZ
      name={`${stop}Date`}
      value={value}
      onChange={onChangeDate}
      disabled={!canEdit}
      locationTimeZone={locationTimeZone}
    />
  );
};

const StageDateColumn = ({ ...props }) => {
  const {
    canEdit,
    stop,
    dates,
    showScheduledRow,
    showActualRow,
    showActualStart,
    showActualEnd,
    stage,
    locationTimeZone
  } = props;

  return (
    <Grid.Column>
      <Table basic="very">
        <Table.Body>
          <Table.Row>
            <Table.Cell
              collapsing
              content={
                <Popup
                  content={<Trans i18nKey={`shipment.date.planned.${stop}`} />}
                  trigger={<Icon name="calendar outline" />}
                />
              }
            />
            <Table.Cell
              content={
                <PlannedDate
                  {...{
                    canEdit,
                    stop,
                    value: new Date(dates.arrival.planned),
                    stageId: stage.id,
                    locationTimeZone
                  }}
                />
              }
            />
          </Table.Row>

          {showScheduledRow && (
            <StageDate
              i18nKey={`shipment.date.scheduled.${stop}`}
              iconName="calendar alternate outline"
              date={dates.arrival.scheduled}
              locationTimeZone={locationTimeZone}
            />
          )}

          {showActualRow && (
            <StageDate
              i18nKey={`shipment.date.actual.${stop}`}
              iconName="calendar check outline"
              date={dates.arrival.actual}
              locationTimeZone={locationTimeZone}
            />
          )}

          {showActualStart && (
            <StageDate
              i18nKey={`shipment.date.start.${stop}`}
              iconName="calendar alternate outline"
              date={dates.start?.actual}
              locationTimeZone={locationTimeZone}
            />
          )}

          {showActualEnd && (
            <StageDate
              i18nKey={`shipment.date.end.${stop}`}
              iconName="calendar alternate outline"
              date={dates.end?.actual}
              locationTimeZone={locationTimeZone}
            />
          )}
        </Table.Body>
      </Table>
    </Grid.Column>
  );
};

StageDateColumn.propTypes = {
  canEdit: PropTypes.bool,
  stop: PropTypes.oneOf(["pickup", "delivery"]),
  stage: PropTypes.object,
  dates: PropTypes.object,
  locationTimeZone: PropTypes.string,
  showScheduledRow: PropTypes.bool,
  showActualRow: PropTypes.bool
};

export default StageDateColumn;
