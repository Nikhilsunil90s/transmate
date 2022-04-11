/* eslint-disable no-use-before-define */
import React from "react";
import { Trans } from "react-i18next";
import SimpleSchema from "simpl-schema";
import { AutoForm, AutoFields, ErrorsField } from "uniforms-semantic";

import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

const debug = require("debug")("settings:data");

let formRef;
const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    group: String,
    code: String,
    name: String
  })
);

export const ProjectForm = ({ project, onSave }) => {
  return (
    <AutoForm
      schema={schema}
      model={project}
      onSubmit={onSave}
      ref={ref => {
        formRef = ref;
      }}
    >
      <AutoFields />
      <ErrorsField />
    </AutoForm>
  );
};

const ProjectModal = ({ onSave, project, index, show, showModal }) => {
  const onSubmitForm = updatedProject => {
    debug("saving data");
    onSave(updatedProject, index);
  };

  return (
    <ModalComponent
      show={show}
      title={<Trans i18nKey="projects.settings.modal.title" />}
      showModal={showModal}
      body={<ProjectForm {...{ project, onSave: onSubmitForm }} />}
      actions={<ModalActions {...{ showModal, onSave: () => formRef.submit() }} />}
    />
  );
};

export default ProjectModal;
