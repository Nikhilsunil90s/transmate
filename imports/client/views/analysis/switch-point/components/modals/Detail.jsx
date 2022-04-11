import React from "react";
import PropTypes from "prop-types";
import { Trans } from "react-i18next";
import { lanePropType } from "../../utils/propTypes";
import { ModalComponent, ModalActionsClose } from "/imports/client/components/modals";
import { LineChart } from "/imports/client/components/charts";

const debug = require("debug")("switchPoint:UI");

function buildTitle(lane) {
  let title = <Trans i18nKey="analysis.switchPoint.details.title" />;
  if (!lane?.from || !lane?.to) return title;
  const { from, to } = lane || {};
  title += from.CC + from.zip;
  title += ` - ${to.CC}${to.zip}`;
  return title;
}

const SwitchPointAnalyisDetailModal = ({ show, showModal, lane, intervals }) => {
  const series = (lane?.calculations || []).map(item => ({
    name: item.priceList?.title,
    data: item.calculation
  }));

  const steps = (intervals || []).map(step => {
    if (step > 1000) {
      return `${Math.round(step / 100) / 10}k`;
    }
    return step;
  });

  debug("series, steps", { series, steps });

  return (
    <ModalComponent
      size="large"
      show={show}
      showModal={showModal}
      title={buildTitle(lane)}
      body={<LineChart />}
      actions={<ModalActionsClose showModal={showModal} />}
    />
  );
};

SwitchPointAnalyisDetailModal.propTypes = {
  show: PropTypes.bool.isRequired,
  showModal: PropTypes.func.isRequired,
  lane: lanePropType,
  intervals: PropTypes.arrayOf(PropTypes.number)
};

export default SwitchPointAnalyisDetailModal;
