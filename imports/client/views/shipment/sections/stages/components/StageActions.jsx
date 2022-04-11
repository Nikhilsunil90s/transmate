import React, { useState } from "react";
import { toast } from "react-toastify";
import { useApolloClient } from "@apollo/client";
import { Trans } from "react-i18next";
import { Button, Popup } from "semantic-ui-react";

import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import { SplitStageModal, ConfirmStageModal, ScheduleStageModal } from "../modals";
import { STAGE_STATUS_UPDATE, STAGE_MERGE } from "../utils/queries";

const debug = require("debug")("stage:stageActions");

const ShipmentStageActions = ({ ...props }) => {
  const [loading, setLoading] = useState(false);
  const [modalProps, setModalProps] = useState({
    show: false,
    actions: <></>
  });
  const [stageSplitVisible, showStageSplitModal] = useState();
  const [stageConfirmVisible, showStageConfirmModal] = useState();
  const [stageScheduleVisible, showStageScheduleModal] = useState();
  const showModal = show => setModalProps({ ...modalProps, show });
  const { stage, stageSecurity = {} } = props;

  const client = useApolloClient();

  const {
    canPutBackToDraft,
    canPutStageToPlanned,
    canConfirmDates,
    canRelease,
    stageReadyForRelease,
    stageReleaseAudit = {},
    canSchedule,
    canSplitStage,
    canMergeStage
  } = stageSecurity;

  function updateStatus(status) {
    setLoading(true);
    client
      .mutate({
        mutation: STAGE_STATUS_UPDATE,
        variables: {
          stageId: stage.id,
          status
        }
      })
      .then(({ errors, data }) => {
        debug("stage update result %", { errors, data });
        if (errors) throw errors;

        toast.success(`Stage status: ${status}`);
        showModal(false);
      })
      .catch(error => {
        console.error("error during stage status update", error);
        toast.error("stage update not successfull!");
        setLoading(false);
      });
  }

  function mergeStageQuery() {
    setLoading(true);
    client
      .mutate({
        mutation: STAGE_MERGE,
        variables: { stageId: stage.id }
      })
      .then(({ errors }) => {
        if (errors) throw errors;
        toast.success("Stage merged");
        showModal(false);
      })
      .catch(error => {
        console.error(error);
        toast.error(error);
        setLoading(false);
      });
  }

  const releaseStage = () => {
    if (!stageReadyForRelease) return;

    setModalProps({
      show: true,
      body: (
        <p>
          <Trans i18nKey="shipment.stage.release.confirm" />
        </p>
      ),
      actions: (
        <ModalActions
          showModal={showModal}
          disableBtn={loading}
          saveLabel={<Trans i18nKey="shipment.stage.release.confirmYes" />}
          onSave={() => updateStatus("release")}
        />
      )
    });
  };

  const mergeStage = () => {
    if (!canMergeStage) return;
    setModalProps({
      show: true,
      body: (
        <p>
          <Trans i18nKey="shipment.stage.merge.confirm" />
        </p>
      ),
      actions: <ModalActions showModal={showModal} onSave={mergeStageQuery} />
    });
  };

  const putStageToDraft = () => {
    if (!canPutBackToDraft) return;
    setModalProps({
      show: true,
      body: (
        <p>
          <Trans i18nKey="shipment.stage.draft.confirm" />
        </p>
      ),
      actions: <ModalActions showModal={showModal} onSave={() => updateStatus("draft")} />
    });
  };

  const putStageToPlanned = () => {
    if (!canPutStageToPlanned) return;
    setModalProps({
      show: true,
      body: (
        <p>
          <Trans i18nKey="shipment.stage.planned.confirm" />
        </p>
      ),
      actions: <ModalActions showModal={showModal} onSave={() => updateStatus("planned")} />
    });
  };

  const getFeedbackOnRelease = () => {
    switch (true) {
      case !stageReleaseAudit.fields:
        // stageFieldModal
        return <Trans i18nKey="shipment.stage.release.error.fields" />;
      case !stageReleaseAudit.items:
        return <Trans i18nKey="shipment.stage.release.error.items" />;
      case !stageReleaseAudit.shipper:
        return <Trans i18nKey="shipment.stage.release.error.shipper" />;
      case !stageReleaseAudit.carrier:
        return <Trans i18nKey="shipment.stage.release.error.carrier" />;
      default:
        // another reason why we can't release:
        return <Trans i18nKey="shipment.stage.release.error.other" />;
    }
  };

  return (
    <>
      <Button.Group floated="right">
        {/* carrier & owner can conirm dates in a stage */}
        {/* shows date-time confirmations for the stage */}
        {canConfirmDates && (
          <>
            <Popup
              content={<Trans i18nKey="shipment.stage.menu.confirm" />}
              trigger={
                <Button
                  primary
                  icon="calendar check outline"
                  onClick={() => showStageConfirmModal(true)}
                />
              }
            />
            <ConfirmStageModal
              {...{ show: stageConfirmVisible, showModal: showStageConfirmModal, stage }}
            />
          </>
        )}
        {/* canRelease == the user can do the action, stageRead == the shipment is ready */}
        {canRelease && (
          <Popup
            content={
              stageReadyForRelease ? (
                <Trans i18nKey="shipment.stage.release.action.info" />
              ) : (
                getFeedbackOnRelease()
              )
            }
            inverted
            position="bottom center"
            trigger={
              <Button
                primary={stageReadyForRelease}
                content={<Trans i18nKey="shipment.stage.menu.release" />}
                onClick={releaseStage}
                data-test="StageReleaseBtn"
              />
            }
          />
        )}
        {/* a carrier can schedule the stage == setting the scheduled dates */}
        {/* schedule === carrier setting scheduled dates */}
        {canSchedule && (
          <>
            <Popup
              content={<Trans i18nKey="shipment.stage.menu.schedule" />}
              trigger={
                <Button
                  primary
                  icon="calendar alternate outline"
                  onClick={() => showStageScheduleModal(true)}
                />
              }
            />
            <ScheduleStageModal
              {...{ show: stageScheduleVisible, showModal: showStageScheduleModal, stage }}
            />
          </>
        )}
        {canSplitStage && (
          <>
            <Popup
              content={<Trans i18nKey="shipment.stage.menu.split" />}
              trigger={
                <Button
                  icon="share alternate"
                  onClick={() => showStageSplitModal(true)}
                  data-test="StageSplitBtn"
                />
              }
            />
            <SplitStageModal
              {...{ show: stageSplitVisible, showModal: showStageSplitModal, stage }}
            />
          </>
        )}
        {canMergeStage && (
          <Popup
            content={<Trans i18nKey="shipment.stage.menu.merge" />}
            trigger={
              <Button icon="circle outline" onClick={mergeStage} data-test="StageMergeBtn" />
            }
          />
        )}
        {canPutBackToDraft && (
          <Popup
            content={<Trans i18nKey="shipment.stage.menu.draft" />}
            trigger={<Button icon="write" onClick={putStageToDraft} data-test="StageDraftBtn" />}
          />
        )}
        {canPutStageToPlanned && (
          <Popup
            content={<Trans i18nKey="shipment.stage.menu.planned" />}
            trigger={<Button icon="undo" onClick={putStageToPlanned} />}
          />
        )}
        )
      </Button.Group>
      <ModalComponent {...modalProps} showModal={showModal} />
    </>
  );
};

export default ShipmentStageActions;
