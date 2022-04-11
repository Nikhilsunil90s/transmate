import React from "react";
import { Trans } from "react-i18next";
import { Button, Form } from "semantic-ui-react";
import { ModalComponent, ModalActionsClose } from "/imports/client/components/modals";
import { sAlertCallback } from "/imports/utils/UI/sAlertCallback";
import { useApolloClient } from "@apollo/client";
import { UPDATE_TASK_MUTATION } from "../queries";

const TaskModal = ({ taskId, task, show, showModal }) => {
  const client = useApolloClient();
  async function approveTask() {
    // const callback = (err, res) => {
    //   sAlertCallback(err, res, { onSuccessCb: () => showModal(false) });
    // };

    const { errors, data } = await client.mutate({
      mutation: UPDATE_TASK_MUTATION,
      variables: {
        input: { taskId, options: { complete: true } }
      }
    });

    sAlertCallback(errors?.[0], data, { onSuccessCb: () => showModal(false) });

    // use the GQL method instead
    // Meteor.call("task.update", { taskId, options: { complete: true } }, callback);
  }

  return (
    <ModalComponent
      show={show}
      title="Task"
      showModal={showModal}
      body={
        <Form>
          {task?.userParams?.notes && <p>{task.userParams.notes}</p>}
          {task?.taskType === "approval" && (
            <Button primary content={<Trans i18nKey="form.approve" />} onClick={approveTask} />
          )}
        </Form>
      }
      actions={<ModalActionsClose {...{ showModal }} />}
    />
  );
};

export default TaskModal;
