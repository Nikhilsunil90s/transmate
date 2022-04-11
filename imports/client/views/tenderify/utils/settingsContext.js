import React from "react";

const SettingsContext = React.createContext({});
export const SettingsProvider = SettingsContext.Provider;
export default SettingsContext;

/*
 context: {
  headerMappingOptions:[{}]
  mapBlocks: ["origin", "target"]
  mappingKeys: [{}]
  mappingListOptions: {services: Array(), equipments: Array(), multipliers: Array()}
  mappingParents: ["lanes", "charges", "equipments", "volumes", "goods"]
  mappingStoreOptions: ["file", "account", "partnership", "ignore"]
}
*/
