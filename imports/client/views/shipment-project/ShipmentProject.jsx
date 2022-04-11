import { Trans } from "react-i18next";
import { toast } from "react-toastify";
import React, { useState, useCallback, useContext } from "react";
import { useQuery } from "@apollo/client";

import { Menu } from "semantic-ui-react";
import Footer from "./components/Footer";
import { General, Inbound, Outbound, Notes, Report } from "./projectTabs";
import Loader from "/imports/client/components/utilities/Loader";

import LoginContext from "/imports/client/context/loginContext";
import { GET_PROJECT } from "./utils/queries";
import { initializeSecurity } from "./utils/security";
import useRoute from "../../router/useRoute";
import { generateRoutePath } from "../../router/routes-helpers";

const debug = require("debug")("project:UI");

const TABS = ["General", "Inbound", "Outbound", "Notes"];
const ADMIN_TABS = ["KPI"];
const DEFAULT_TAB = "General";

const ShipmentProject = ({ ...props }) => {
  const { projectId, canEdit } = props;
  const { params, history } = useRoute();

  //#region tab menu
  const allTabs = [...TABS, ...(canEdit ? ADMIN_TABS : [])];
  const section = params.section || 0;
  const initialTab = section || DEFAULT_TAB;
  const [activeTab, setActiveTab] = useState(initialTab);

  const selectTab = useCallback(
    name => {
      history.replace(
        generateRoutePath("project", { _id: projectId, section: name || initialTab })
      );

      setActiveTab(name);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectId]
  );

  const handleTabClick = (e, { name }) => selectTab(name);
  //#endregion

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
            content: <Trans i18nKey={`projects.tabs.${key}`} />,
            active: key === activeTab
          }))}
          onItemClick={handleTabClick}
        />
        {activeTab === "General" && <General {...props} />}
        {activeTab === "Inbound" && <Inbound {...props} />}
        {activeTab === "Outbound" && <Outbound {...props} />}
        {activeTab === "Notes" && <Notes {...props} />}
        {canEdit && activeTab === "KPI" && <Report {...props} />}
      </div>
      {["Notes", "General"].includes(activeTab) && <Footer {...props} />}
    </>
  );
};

const ShipmentProjectLoader = () => {
  const { goRoutePath, params } = useRoute();
  const context = useContext(LoginContext);
  const projectId = params._id;
  let existingProject = false;

  const { data = {}, loading: isLoading, error: fetchProjectError, refetch } = useQuery(
    GET_PROJECT,
    { variables: { shipmentProjectId: projectId } }
  );
  const { shipmentProject = {} } = data;
  debug("project general data", { shipmentProject, fetchProjectError });
  existingProject = shipmentProject;

  const canEdit = existingProject ? existingProject.canEdit : true;
  const security = initializeSecurity({ project: shipmentProject, context });

  if (isLoading) return <Loader loading />;

  if (!shipmentProject) {
    goRoutePath("/404");
    return toast.error(`Project ${projectId} not found, or you have no access to see it!`);
  }

  return (
    <ShipmentProject
      projectId={projectId}
      project={existingProject}
      security={security}
      canEdit={canEdit}
      isLoading={isLoading}
      refetch={refetch}
    />
  );
};

export default ShipmentProjectLoader;
