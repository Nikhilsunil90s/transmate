import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import { Trans } from "react-i18next";
import { toast } from "react-toastify";
import { Button, Segment } from "semantic-ui-react";
import useRoute from "/imports/client/router/useRoute";
import RemoveProjectModal from "./RemoveProjectModal";
import { REMOVE_PROJECT } from "../utils/queries";

const ProjectFooter = ({ security, projectId }) => {
  const [show, showModal] = useState(false);
  const [removeShipmentProject] = useMutation(REMOVE_PROJECT);
  const { goRoute } = useRoute();

  function onConfirmDelete({ linkedShipmentAction }) {
    removeShipmentProject({ variables: { input: { projectId, linkedShipmentAction } } })
      .then(() => {
        goRoute("projects");
        toast.success(<Trans i18nKey="project.remove.success" />);
        showModal(false);
      })
      .catch(error => {
        console.error({ error });
        toast.error(<Trans i18nKey="projects.remove.error" />);
      });
  }

  return (
    <Segment as="footer">
      <div>
        <Button
          primary
          icon="arrow left"
          id="close"
          content={<Trans i18nKey="form.back" />}
          onClick={() => goRoute("projects")}
        />
        {security.canRemoveProject && (
          <>
            <Button
              primary
              basic
              negative
              id="remove"
              content={<Trans i18nKey="projects.remove.btn" />}
              onClick={() => showModal(true)}
            />
            <RemoveProjectModal show={show} showModal={showModal} onConfirm={onConfirmDelete} />
          </>
        )}
      </div>
    </Segment>
  );
};

export default ProjectFooter;
