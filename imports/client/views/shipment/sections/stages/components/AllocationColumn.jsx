import React, { useState } from "react";
import { useApolloClient } from "@apollo/client";
import { Trans } from "react-i18next";
import { toast } from "react-toastify";
import { Button, Grid, Icon, Popup } from "semantic-ui-react";
import classNames from "classnames";

import { PartnerTag } from "/imports/client/components/tags";
import SelectPartnerModal from "/imports/client/components/modals/specific/partnerSelect";
import DriverAllocationModal from "../modals/Driver.jsx";

import { UPDATE_STAGE } from "../utils/queries";

//#region components
const DriverAllocationField = ({ ...props }) => {
  const { stage } = props;
  const [show, showModal] = useState(false);
  return (
    <>
      <div className="field">
        <label>
          <Trans i18nKey="shipment.stage.driver.label" />
        </label>
        {stage.status !== "completed" && (
          <Popup
            content={
              stage.driverId ? (
                <Trans i18nKey="shipment.stage.driver.button_change" />
              ) : (
                <Trans i18nKey="shipment.stage.driver.button" />
              )
            }
            trigger={
              <Button
                primary
                floated="right"
                onClick={() => showModal(true)}
                icon="mobile alternate"
              />
            }
          />
        )}
        {stage.plate || ""}{" "}
        <div style={{ opacity: "0.5" }}>
          {stage.driver || <Trans i18nKey="shipment.stage.driver.none" />}
        </div>
      </div>
      <DriverAllocationModal {...props} {...{ show, showModal }} />
    </>
  );
};

const PartnerAllocationField = ({ stage, canChangeCarrier, canViewAssignedCarrier }) => {
  const client = useApolloClient();
  const onChangePartner = ({ partnerId }) => {
    client
      .mutate({
        mutation: UPDATE_STAGE,
        variables: {
          input: {
            stageId: stage.id,
            updates: { carrierId: partnerId }
          }
        }
      })
      .then(({ errors }) => {
        if (errors) throw errors;
        toast.success("Date modified");
      })
      .catch(error => {
        console.error(error);
        toast.error(error);
      });
  };
  return (
    <div className="field">
      <label>
        <Trans i18nKey="shipment.stage.carrier.label" />
      </label>
      <div
        className={classNames("relative", { editable: canChangeCarrier })}
        style={{ position: "relative" }}
      >
        <div className="float top right" style={{ visibility: "hidden" }}>
          <SelectPartnerModal
            options={{ types: ["carrier"] }}
            onSave={onChangePartner}
            includeOwnAccount
          >
            <Icon name="pencil" color="grey" />
          </SelectPartnerModal>
        </div>
        <div className="content">
          {/* is assigned and can view the carrier */}
          {stage.carrierId && canViewAssignedCarrier && (
            <>
              <PartnerTag accountId={stage.carrierId} />{" "}
              {stage.plate ? <div style={{ opacity: "0.5" }}>{stage.plate}</div> : ""}
            </>
          )}

          {/* is assigned but can't view */}
          {stage.carrierId && !canViewAssignedCarrier && (
            <Trans i18nKey="shipment.stage.carrier.hidden" />
          )}

          {/* not assigned */}
          {!stage.carrierId && <Trans i18nKey="shipment.stage.carrier.not-assigned" />}
        </div>
      </div>
    </div>
  );
};

//#endregion

const StageAllocationColumn = ({ ...props }) => {
  const { canAssignDriver } = props;
  return (
    <Grid.Column className={canAssignDriver ? "driver" : "partner"}>
      {canAssignDriver ? (
        <DriverAllocationField {...props} />
      ) : (
        <PartnerAllocationField {...props} />
      )}
    </Grid.Column>
  );
};

export default StageAllocationColumn;
