import React, { useState } from "react";
import { useApolloClient } from "@apollo/client";
import PropTypes from "prop-types";
import { Segment, Header, Button, Table, Popup, Icon } from "semantic-ui-react";
import { toast } from "react-toastify";
import { ConfirmComponent } from "/imports/client/components/modals";
import ProjectModal from "./modals/ProjectModal";
import { INITIALIZE_YEAR_FOR_CODE } from "./queries";
import { GET_PROJECT_SETTINGS } from "../../../../utils/queries";

const debug = require("debug")("settings:project");

const ProjectCodes = ({ onSave, security, projectCodes: projects, projectYears }) => {
  const client = useApolloClient();
  const [confirmState, setConfirmState] = useState({ show: false });
  const showConfirm = show => setConfirmState({ ...confirmState, show });
  const [modalState, setModalState] = useState({ show: false });
  const showModal = show => setModalState({ ...modalState, show });
  const canEdit = security.canEditProjects;

  const lastProjectYear = projectYears[projectYears.length - 1];

  const removeItem = index => {
    const projectCodes = [...projects.slice(0, index), ...projects.slice(index + 1)];
    onSave({ projectCodes });
  };

  const initializeCode = () => {
    const { index } = confirmState;
    if (!(index > -1)) return;
    const projectSetting = projects[index];
    const input = {
      projectCode: projectSetting.code,
      projectGroup: projectSetting.group,
      newYear: lastProjectYear
    };

    debug("initializing year for %o", input);

    client
      .mutate({
        mutation: INITIALIZE_YEAR_FOR_CODE,
        variables: { input },
        refetchQueries: [{ query: GET_PROJECT_SETTINGS }]
      })
      .then(({ data = {}, errors }) => {
        if (errors) throw errors;
        debug(data);
        toast.success("Code initialized");
        showConfirm(false);
      })
      .catch(error => {
        toast.error("Could not initialize code");
        console.error({ error });
      });
  };

  function onSaveCodes(updatedProject, index) {
    const mod = [...projects];
    if (index > -1) {
      mod[index] = updatedProject;
    } else {
      mod.push({ ...updatedProject, lastActiveYear: lastProjectYear });
    }
    debug("saving codes", mod);
    onSave({ projectCodes: mod }, () => showModal(false));
  }

  return (
    <Segment>
      <Header as="h6">Project Codes</Header>
      {canEdit && (
        <Segment
          clearing
          content={<Button basic content="Add Code" onClick={() => showModal(true)} />}
        />
      )}
      <Table
        headerRow={["Group", "Code", "name", "last act. year", ""]}
        tableData={projects}
        renderBodyRow={({ group, code, name, lastActiveYear = "" }, i) => ({
          key: `row-${i}`,
          cells: [
            group,
            code,
            name,
            {
              key: "lastActiveYear",
              content:
                lastActiveYear !== lastProjectYear ? (
                  <>
                    <Popup
                      content="Year is not up to date with latest project year."
                      trigger={<Icon name="exclamation" />}
                    />{" "}
                    {lastActiveYear}
                  </>
                ) : (
                  lastActiveYear
                )
            },
            canEdit && {
              key: "actions",
              content: (
                <Button.Group>
                  {[
                    {
                      key: "edit",
                      icon: "pencil",
                      tooltip: "Edit code",
                      onClick: () => setModalState({ show: true, project: projects[i], index: i })
                    },
                    ...(lastActiveYear !== lastProjectYear
                      ? [
                          {
                            key: "init",
                            icon: "angle double right",
                            tooltip: "Initialize code for new year.",
                            onClick: () =>
                              setConfirmState({
                                show: true,
                                content: `This will initialze project code ${code} for year: ${lastProjectYear}. Proceed?`,
                                index: i
                              })
                          }
                        ]
                      : []),
                    {
                      key: "remove",
                      icon: "trash alternate outline",
                      tooltip: "Remove code",
                      onClick: () => removeItem(i)
                    }
                  ].map(({ key, tooltip, ...btnProps }) => (
                    <Popup key={key} content={tooltip} trigger={<Button {...btnProps} />} />
                  ))}
                </Button.Group>
              )
            }
          ]
        })}
      />
      <ProjectModal {...modalState} showModal={showModal} onSave={onSaveCodes} />
      <ConfirmComponent {...confirmState} showConfirm={showConfirm} onConfirm={initializeCode} />
    </Segment>
  );
};

ProjectCodes.propTypes = {
  onSave: PropTypes.func.isRequired,
  security: PropTypes.object.isRequired,
  // eslint-disable-next-line react/require-default-props
  projectCodes: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      group: PropTypes.string.isRequired,
      name: PropTypes.string,
      lastActiveYear: PropTypes.number
    })
  ).isRequired,
  projectYears: PropTypes.arrayOf(PropTypes.number).isRequired
};

export default ProjectCodes;
