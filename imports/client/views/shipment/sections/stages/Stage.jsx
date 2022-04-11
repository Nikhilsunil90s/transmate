import React from "react";
import { Trans } from "react-i18next";
import { Segment, Grid, Form } from "semantic-ui-react";
import classNames from "classnames";
import get from "lodash.get";
import { stagePropTypes } from "./utils/propTypes";

import {
  StageActions,
  StageAddressColumn,
  StageModeColumn,
  StageAllocationColumn,
  StageDateColumn
} from "./components";

const ShipmentStageSection = ({ ...props }) => {
  const { stage, shipment, stageSecurity = {} } = props;
  const stageNumber = `${shipment.number}-${stage.sequence}`;
  const showScheduledRow =
    !!get(stage, ["dates", "pickup", "arrival", "scheduled"]) ||
    !!get(stage, ["dates", "delivery", "arrival", "scheduled"]);
  const showActualRow =
    !!get(stage, ["dates", "pickup", "arrival", "actual"]) ||
    !!get(stage, ["dates", "delivery", "arrival", "actual"]);
  const showActualStart =
    !!get(stage, ["dates", "pickup", "start", "actual"]) ||
    !!get(stage, ["dates", "delivery", "start", "actual"]);
  const showActualEnd =
    !!get(stage, ["dates", "pickup", "end", "actual"]) ||
    !!get(stage, ["dates", "delivery", "end", "actual"]);

  const {
    canChangeAddress,
    canChangeMode,
    canAssignDriver,
    canChangeCarrier,
    canModifyPlannedDates,
    canViewAssignedCarrier
  } = stageSecurity;

  return (
    stage && (
      <Segment padded="very" className={classNames("stage", stage.status)}>
        <StageActions {...props} />

        <h3 className="section-header">
          {<Trans i18nKey="shipment.stage.stage" />} {stageNumber}
          <span className="status">{stage.status}</span>
        </h3>

        <Form>
          <Grid columns={2}>
            <Grid.Row>
              <StageAddressColumn
                {...{
                  editable: canChangeAddress && stage.sequence === 1,
                  stop: "pickup",
                  location: stage.from,
                  stageId: stage.id,
                  accountId: shipment.accountId
                }}
              />
              <StageAddressColumn
                {...{
                  editable: canChangeAddress,
                  stop: "delivery",
                  location: stage.to,
                  stageId: stage.id,
                  accountId: shipment.accountId
                }}
              />
            </Grid.Row>
            <Grid.Row>
              <StageModeColumn {...props} canChangeMode={canChangeMode} />
              <StageAllocationColumn
                {...props}
                canViewAssignedCarrier={canViewAssignedCarrier}
                canAssignDriver={canAssignDriver}
                canChangeCarrier={canChangeCarrier}
              />
            </Grid.Row>
            <Grid.Row>
              <StageDateColumn
                {...{
                  canEdit: canModifyPlannedDates,
                  stop: "pickup",
                  dates: stage.dates.pickup,
                  locationTimeZone: stage.from.timeZone,
                  showScheduledRow,
                  showActualRow,
                  showActualStart,
                  showActualEnd,
                  ...props
                }}
              />
              <StageDateColumn
                {...{
                  canEdit: canModifyPlannedDates,
                  stop: "delivery",
                  dates: stage.dates.delivery,
                  locationTimeZone: stage.to.timeZone,
                  showScheduledRow,
                  showActualRow,
                  showActualStart,
                  showActualEnd,
                  ...props
                }}
              />
            </Grid.Row>
          </Grid>
        </Form>
      </Segment>
    )
  );
};

ShipmentStageSection.propTypes = { ...stagePropTypes };

export default ShipmentStageSection;
