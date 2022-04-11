import React from "react";
import { Trans } from "react-i18next";
import { Button } from "semantic-ui-react";
import PropTypes from "prop-types";

export const ModalActions = ({ showModal, onCancel, onSave, saveLabel, disable, disabled }) => (
  <>
    <Button
      data-test="modalCancel"
      onClick={() => {
        if (onCancel) onCancel();
        showModal(false);
      }}
    >
      <Trans i18nKey="form.cancel" />
    </Button>
    <Button
      primary
      data-test="modalConfirm"
      onClick={onSave}
      disabled={disable || disabled}
      loading={disable || disabled}
      icon="save outline"
      content={saveLabel || <Trans i18nKey="form.save" />}
    />
  </>
);

ModalActions.propTypes = {
  showModal: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  saveLabel: PropTypes.string,
  disable: PropTypes.bool,
  disabled: PropTypes.bool
};

export const ModalActionsClose = ({ showModal }) => (
  <Button onClick={() => showModal(false)}>
    <Trans i18nKey="form.cancel" />
  </Button>
);

ModalActionsClose.propTypes = {
  showModal: PropTypes.func.isRequired
};

export const ModalActionsDelete = ({
  showModal,
  onSave,
  onDelete,
  saveLabel,
  disable,
  disabled
}) => (
  <>
    <Button onClick={() => showModal(false)} content={<Trans i18nKey="form.cancel" />} />
    <Button onClick={onDelete} color="red" content={<Trans i18nKey="form.delete" />} />
    <Button
      primary
      onClick={onSave}
      disabled={disable || disabled}
      loading={disable || disabled}
      icon="save outline"
      content={saveLabel || <Trans i18nKey="form.save" />}
    />
  </>
);

ModalActionsDelete.propTypes = {
  showModal: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  saveLabel: PropTypes.string,
  disable: PropTypes.bool,
  disabled: PropTypes.bool
};

export default ModalActions;
