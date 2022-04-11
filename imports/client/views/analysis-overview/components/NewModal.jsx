import { toast } from "react-toastify";
import React from "react";
import moment from "moment";

import { useMutation } from "@apollo/client";
import PropTypes from "prop-types";
import { Trans, useTranslation } from "react-i18next";
import { List, Icon } from "semantic-ui-react";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";

import { CREATE_ANALYSIS } from "../utils/queries";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("analysis");

const SIMULATION_TYPES = [
  {
    type: "simulation",
    title: <Trans i18nKey="analysis.types.simulation" />,
    icon: "wizard",
    description: <Trans i18nKey="analysis.simulation.description" />
  },
  {
    type: "switchPoint",
    title: <Trans i18nKey="analysis.types.switchPoint" />,
    icon: "random",
    description: <Trans i18nKey="analysis.switchPoint.description" />
  }
];

const AnalysisNewModal = ({ ...props }) => {
  const { t } = useTranslation();
  const { show, showModal } = props;
  const [createAnalysis] = useMutation(CREATE_ANALYSIS);
  const { goRoute } = useRoute();

  const createHandler = async type => {
    const nameRoot = t(`analysis.types.${type}`);
    const name = `${nameRoot} ${moment().format("YYYY-MM-DD")}`;
    const { data, error } = await createAnalysis({ variables: { input: { type, name } } });
    debug("create handler %o", { data, error });
    const analysisId = data?.createAnalysis;
    if (error || !analysisId) return toast.error("Could not create analysis");

    showModal(false);
    return goRoute("analysis", { _id: analysisId });
  };

  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={<Trans i18nKey="analysis.button.new" />}
      body={
        <List relaxed="very">
          {SIMULATION_TYPES.map((item, i) => (
            <List.Item
              key={i}
              as="a"
              icon={<Icon name={item.icon} size="large" />}
              content={
                <>
                  <List.Header content={item.title} />
                  <List.Description content={item.description} />
                </>
              }
              onClick={() => createHandler(item.type)}
            />
          ))}
        </List>
      }
      actions={<ModalActions {...{ showModal, onSave: () => {} }} />}
    />
  );
};

AnalysisNewModal.propTypes = {
  show: PropTypes.bool,
  showModal: PropTypes.func
};

export default AnalysisNewModal;
