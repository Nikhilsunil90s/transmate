import { useQuery } from "@apollo/client";
import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Message, Segment, Table } from "semantic-ui-react";
import Loader from "/imports/client/components/utilities/Loader.jsx";
import { ConfirmComponent } from "/imports/client/components/modals";

import ProjectCodes from "./ProjectCodes";
import { GET_PROJECT_SETTINGS } from "../../../../utils/queries";

const debug = require("debug")("settings:project");

const SettingsMasterDataProjects = ({ ...props }) => {
  const [confirmState, setConfirmState] = useState({ show: false });
  const showConfirm = show => setConfirmState({ ...confirmState, show });
  const { onSave, security } = props;
  const { data = {}, loading, error, refetch } = useQuery(GET_PROJECT_SETTINGS);
  debug("project data %o", { data, loading, error });
  if (error) console.error(error);

  const canEdit = security.canEditProjects;
  const years = data.accountSettings?.projectYears || [];
  const projectCodes = data.accountSettings?.projectCodes || [];

  function addYear() {
    const lastItem = years[years.length - 1];
    const nextYear = lastItem ? Number(lastItem) + 1 : new Date().getFullYear();

    onSave({ projectYears: [...years, nextYear] }, () => refetch());
  }

  function removeYear() {
    const { index } = confirmState;
    const projectYears = years.filter((yr, idx) => idx !== index);
    onSave({ projectYears }, () => refetch());
  }

  return (
    <>
      {loading ? (
        <Loader loading />
      ) : (
        <>
          <h4>Projects</h4>

          <Segment>
            <h6>Project Years</h6>
            <Message
              info
              content="
          When adding a year, all projects and shipments from the preceding year will be copied
          over. This process can take up to a couple of minutes to complete."
            />

            {canEdit && <Button basic content="Add year" onClick={addYear} />}

            <Table celled>
              <Table.Body>
                {years.map((year, i) => (
                  <Table.Row key={i}>
                    <Table.Cell>{year}</Table.Cell>
                    <Table.Cell className="collapsing">
                      {canEdit && (
                        <Button
                          icon="trash alternate"
                          onClick={() => setConfirmState({ show: true, index: i })}
                        />
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
            <ConfirmComponent {...confirmState} showConfirm={showConfirm} onConfirm={removeYear} />
          </Segment>

          <ProjectCodes {...props} {...{ projectCodes }} projectYears={years} />
        </>
      )}
    </>
  );
};

SettingsMasterDataProjects.propTypes = {
  onSave: PropTypes.func.isRequired,
  security: PropTypes.object.isRequired
};

export default SettingsMasterDataProjects;
