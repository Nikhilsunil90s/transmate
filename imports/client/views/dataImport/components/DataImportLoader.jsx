/* eslint-disable no-use-before-define */
import React from "react";
import PropTypes from "prop-types";
import { Label, Menu, Tab } from "semantic-ui-react";

import DataImportOverview from "./DataImportOverview";
import useEdiJobs from "../utils/useEdiJobs";

const DataImportLoader = ({ selector }) => {
  const { isLoadingDocuments, documents } = useEdiJobs(selector?.importId);

  const successItems = documents.filter(({ status }) => status !== "failed");
  const failedItems = documents.filter(({ status }) => status === "failed");

  return (
    <Tab
      menu={{ pointing: true }}
      panes={[
        {
          menuItem: (
            <Menu.Item key="results">
              Results
              {!isLoadingDocuments && (
                <Label color="teal" floating>
                  {successItems.length}
                </Label>
              )}
            </Menu.Item>
          ),
          render: () => (
            <Tab.Pane>
              <DataImportOverview
                isLoadingDocuments={isLoadingDocuments}
                documents={successItems}
              />
            </Tab.Pane>
          )
        },
        {
          menuItem: (
            <Menu.Item key="errors">
              Errors
              {!isLoadingDocuments && (
                <Label floating color="red">
                  {failedItems.length}
                </Label>
              )}
            </Menu.Item>
          ),
          render: () => (
            <Tab.Pane>
              <DataImportOverview isLoadingDocuments={isLoadingDocuments} documents={failedItems} />
            </Tab.Pane>
          )
        }
      ]}
    />
  );
};

DataImportLoader.propTypes = {
  selector: PropTypes.shape({
    importId: PropTypes.string
  })
};

export default DataImportLoader;
