import React from "react";
import { toast } from "react-toastify";
import { useApolloClient } from "@apollo/client";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";

import SettingsMasterDataProjects from "./projects/Projects";
import SettingsMasterDataGeneral from "./general/General";

import { SAVE_MASTER_DATA } from "../../../utils/queries";

const debug = require("debug")("settings");

const SETTINGS = require("../../../allSettings.json");

const TEMPLATES = {
  // SettingsMasterDataConversions,
  SettingsMasterDataProjects,
  SettingsMasterDataGeneral
};

const DynamicComponent = ({ template, ...props }) => {
  if (typeof TEMPLATES[template] !== "undefined") {
    return React.createElement(TEMPLATES[template], { ...props });
  }
  return React.createElement(() => <div>not found</div>);
};

// page loads suppages based on topic
const SettingsMasterData = ({ ...props }) => {
  const client = useApolloClient();
  const { title, icon, topic } = props;

  const { template, ...componentProps } =
    SETTINGS.menu.find(({ parent, key }) => parent === "master-data" && key === topic) || {};

  const saveMasterData = (updates, callback) => {
    debug("saving masterData", updates);
    client
      .mutate({
        mutation: SAVE_MASTER_DATA,
        variables: { updates }
      })
      .then(({ errors }) => {
        if (errors) throw errors;
        toast.success("updates saved");
        if (callback) callback();
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not save daa");
      });
  };
  return (
    <IconSegment
      title={title}
      icon={icon}
      body={
        <DynamicComponent
          template={template}
          {...props}
          {...componentProps}
          onSave={saveMasterData}
        />
      }
    />
  );
};

export default SettingsMasterData;
