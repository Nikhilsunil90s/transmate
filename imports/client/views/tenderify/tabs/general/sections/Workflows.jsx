import React, { useState } from "react";
import { Trans } from "react-i18next";
import { Button } from "semantic-ui-react";

import WorkflowModal from "/imports/client/views/bpmn-workflows/modal/Workflow.jsx";
import WorkflowsOverview from "/imports/client/views/bpmn-workflows/components/BpmnWorkflowsOverview";

import { IconSegment } from "/imports/client/components/utilities/IconSegment";

const debug = require("debug")("tenderify:workflows");

// Template.TenderifySectionWorkflow.helpers({

//   footerButton() {
//     const { accessControl } = Template.instance().data;
//     debug("can change partner: %s", accessControl("changePartner"));

//     if (accessControl("startWorkflow")) {
//       return {
//         template: "WorkflowModal",
//         button: <Trans i18nKey="workflow.create" />,
//         data: {
//           title: <Trans i18nKey="workflow.modal.title" />,
//           message: <Trans i18nKey="workflow.modal.message" />,
//           disabled: false,
//           onSave({ workflow, data }) {
//             debug("saving workflow %o", { workflow, data });

//             Meteor.call(
//               "tenderify.addWorkflow",
//               {
//                 tenderBidId,
//                 workflow,
//                 data
//               },
//               sAlertCallback
//             );
//           }
//         }
//       };
//     }
//     return undefined;
//   }
// });

const TenderifySectionWorkflow = ({ security, tenderBidId }) => {
  const [show, showModal] = useState(false);
  return (
    <IconSegment
      name="workflow"
      icon="tasks"
      title={<Trans i18nKey="tenderify.workflow.title" />}
      body={
        <WorkflowsOverview
          query={{ references: { type: "tenderBid", id: tenderBidId } }}
          showFooter={false}
        />
      }
      footer={
        security.startWorkflow && (
          <>
            <Button onClick={() => showModal(true)} content={<Trans i18nKey="workflow.create" />} />
            <WorkflowModal show={show} showModal={showModal} />
          </>
        )
      }
    />
  );
};

export default TenderifySectionWorkflow;
