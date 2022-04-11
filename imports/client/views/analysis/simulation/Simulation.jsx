import React, { useState, useCallback, useMemo } from "react";
import { Trans } from "react-i18next";
import { useMutation } from "@apollo/client";
import { Container, Step } from "semantic-ui-react";
import Footer from "./components/Footer.jsx";
import { OptionsTab, StartTab, DataTab, ResultsTab, ReportTab } from "./tabs";
import { steps } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_analysis.js";

import { SAVE_SIMULATION } from "./utils/queries";
import { initializeSecurity } from "./utils/security";
import useRoute from "/imports/client/router/useRoute.js";
import { generateRoutePath } from "/imports/client/router/routes-helpers.js";

const debug = require("debug")("analysis:simulation");

const STEP_ICONS = {
  data: "database",
  results: "lightning",
  report: "chart pie",
  start: "play"
};

export const SimulationPage = ({ redirect, ...props }) => {
  const { analysisId, simulation } = props;
  const { params, history } = useRoute();

  //#region tab menu
  const passedSteps = simulation?.steps || [];
  const section = useMemo(() => params.section, []);
  const initialTab = section || steps[0];
  const [activeTab, setActiveTab] = useState(initialTab);

  const selectTab = useCallback(
    name => {
      history.replace(
        generateRoutePath("analysis", { _id: analysisId, section: name || steps[0] })
      );

      setActiveTab(name);
    },
    [analysisId]
  );

  const handleTabClick = name => selectTab(name);
  //#endregion

  const allProps = { ...props, selectTab };

  return (
    <>
      <div>
        <Step.Group
          size="tiny"
          className="analysis"
          items={steps.map(key => ({
            key,
            "data-test": `${key.replace(" ", ".")}Tab`,
            className: `${key.replace(" ", ".")}Tab`,
            title: <Trans i18nKey={`analysis.simulation.steps.${key}.title`} />,
            description: <Trans i18nKey={`analysis.simulation.steps.${key}.sub`} />,
            icon: STEP_ICONS[key] || key,
            link: true,
            completed: passedSteps.includes(key),
            active: key === activeTab,
            onClick: () => handleTabClick(key)
          }))}
        />
        <Container fluid>
          {activeTab === "options" && <OptionsTab {...allProps} />}
          {activeTab === "start" && <StartTab {...allProps} />}
          {activeTab === "data" && <DataTab {...allProps} />}
          {activeTab === "results" && <ResultsTab {...allProps} />}
        </Container>
        {activeTab === "report" && <ReportTab {...allProps} />}
      </div>
      <Footer {...allProps} {...{ activeTab, redirect }} />
    </>
  );
};
const SimulationPageLoader = ({ analysis, ...props }) => {
  const { analysisId, refetch } = props;
  const [saveSimulation] = useMutation(SAVE_SIMULATION);

  const security = initializeSecurity({ simulation: analysis.simulation });

  const onSave = async (update, cb) => {
    debug("updates: %O", update);

    const {
      data: { savePriceList: result },
      loading: mutationLoading,
      error: mutationError
    } = await saveSimulation({
      variables: {
        input: {
          analysisId,
          update
        }
      }
    });
    debug("save simulation: %o", { result, mutationLoading, mutationError });
    if (mutationError) return console.error("submitted error", mutationError);
    if (cb) cb();
    refetch();
    return null;
  };

  return (
    <SimulationPage
      {...props}
      {...{ security, onSave, simulation: analysis.simulation, analysisId }}
    />
  );
};

export default SimulationPageLoader;
