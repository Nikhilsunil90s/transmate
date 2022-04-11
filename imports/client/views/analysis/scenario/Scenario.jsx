import React, { useState, useCallback } from "react";
import { useMutation } from "@apollo/client";
import { Container, Menu } from "semantic-ui-react";
import Footer from "./components/Footer.jsx";
import { GeneralTab, DetailTab, NewTab } from "./tabs";

import { SAVE_SIMULATION } from "./utils/queries";
import { initializeSecurity } from "./utils/security";
import useRoute from "/imports/client/router/useRoute.js";
import { generateRoutePath } from "/imports/client/router/routes-helpers.js";

const debug = require("debug")("analysis:simulation");

const ALL_TABS = ["general", "single", "overall", "new"];
const DEFAULT_TAB = "general";

export const ScenarioPage = ({ redirect, ...props }) => {
  const { analysisId, scenario } = props;
  const { params, history } = useRoute();

  //#region tab menu
  const allTabs = ALL_TABS;

  const { section } = params;
  const initialTab = section || DEFAULT_TAB;
  const [activeTab, setActiveTab] = useState(initialTab);

  const selectTab = useCallback(
    name => {
      history.replace(
        generateRoutePath("analysis", { _id: analysisId, section: name || allTabs[0] })
      );

      setActiveTab(name);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [analysisId]
  );

  const handleTabClick = (e, { name }) => selectTab(name);
  //#endregion

  const allProps = { ...props, selectTab };

  return (
    <>
      <div>
        <Menu
          pointing
          secondary
          className="tabs"
          items={allTabs.map(key => ({
            key,
            "data-test": `${key}Tab`,
            name: key,
            content: key,
            active: key === activeTab
          }))}
          onItemClick={handleTabClick}
        />
        <Container fluid>
          {activeTab === "general" && <GeneralTab {...allProps} />}
          {activeTab === "single" && (
            <DetailTab
              {...{
                priceLists: scenario?.priceLists,
                detail: scenario?.single,
                scope: scenario?.scope,
                name: "single"
              }}
            />
          )}
          {activeTab === "overall" && (
            <DetailTab
              {...{
                priceLists: scenario?.priceLists,
                detail: scenario?.overall,
                scope: scenario?.scope,
                name: "overall"
              }}
            />
          )}
          {activeTab === "new" && <NewTab {...props} />}
        </Container>
      </div>
      <Footer {...allProps} />
    </>
  );
};
const ScenarioPageLoader = ({ analysis, ...props }) => {
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
    <ScenarioPage {...props} {...{ security, onSave, scenario: analysis.scneario, analysisId }} />
  );
};

export default ScenarioPageLoader;
