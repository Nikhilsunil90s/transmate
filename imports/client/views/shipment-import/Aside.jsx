import React, { useState } from "react";
import get from "lodash.get";

import { Trans } from "react-i18next";
import { useMutation, useQuery } from "@apollo/client";
import { Header, Segment, Divider, Message, Button } from "semantic-ui-react";
import ImportSettingsForm, { GET_IMPORT_TYPES } from "./components/ImportSettings";
import { GET_IMPORT_DOC, UPDATE_IMPORT_SETTINGS } from "./utils/queries";

import useRoute from "../../router/useRoute";

const debug = require("debug")("shipment-import");

function getSteps(imp) {
  let clsJobs;
  let clsProcess;
  let processedDescription;

  let clsMapping = "active";
  if (imp && imp.progress?.data === 100) {
    if (imp.progress?.mapping < 100) {
      clsMapping = "active";
    } else {
      clsMapping = "done";
    }
  }
  let clsErrors = "";
  let ErrorsPerc = 0;

  if (imp && imp.errors && Array.isArray(imp.errors) && Array.isArray(imp.headers)) {
    debug("check validation errors %o", imp.errors);
    if (imp.errors.length > 0) {
      clsErrors = "active";
      ErrorsPerc = imp.errors.length / imp.headers.length;
    } else {
      clsErrors = "done";
    }
  }

  clsJobs = "active";

  const jobProgress = get(imp, ["progress", "jobs"]);
  if (jobProgress > 0 && jobProgress < 100) clsJobs = "active";
  if (jobProgress === 100) clsJobs = "done";

  clsProcess = "active";
  if (imp && imp.progress?.jobs > 0) {
    if (imp.progress.process < 100) {
      clsProcess = "active";
    } else {
      clsProcess = "done";
    }
  }
  if (get(imp, ["total", "shipments"])) {
    // if processed
    // 	if errors
    // 		processedDescription = oldTAPi18n.__ 'edi.steps.process.description_3',
    // 			count: shipments
    // 			errors: errors
    // 	else
    // 		processedDescription = oldTAPi18n.__ 'edi.steps.process.description_2',
    // 			count: shipments
    // else
    // 	processedDescription = oldTAPi18n.__ 'edi.steps.process.description_1',
    // 		count: shipments
    processedDescription = (
      <Trans
        i18nKey="edi.steps.process.description_plain_shipments"
        count={get(imp, ["total", "shipments"])}
      />
    );
  } else {
    processedDescription = <Trans i18nKey="edi.steps.process.description_plain" />;
  }
  return [
    {
      cls: imp && imp.progress?.data === 100 ? "done" : "active",
      progress: (imp && `p-${imp.progress?.data}`) || "p-0",
      title: <Trans i18nKey="edi.steps.import.title" />,
      description: <Trans i18nKey="edi.steps.import.description" />
    },
    {
      cls: clsMapping,
      progress: (imp && `p-${imp.progress?.mapping}`) || "p-0",
      title: <Trans i18nKey="edi.steps.mapping.title" />,
      description: <Trans i18nKey="edi.steps.mapping.description" />
    },
    {
      cls: clsErrors,
      progress: `p-${ErrorsPerc}` || "p-0",
      title: <Trans i18nKey="edi.steps.errorFree.title" />,
      description: <Trans i18nKey="edi.steps.errorFree.description" />
    },
    {
      cls: clsJobs,
      progress: (imp && `p-${imp.progress?.jobs}`) || "p-0",
      title: <Trans i18nKey="edi.steps.jobs.title" />,
      description: <Trans i18nKey="edi.steps.jobs.description" />
    },
    {
      cls: clsProcess,
      progress: (imp && `p-${imp.progress?.process}`) || "p-0",
      title: <Trans i18nKey="edi.steps.process.title" />,
      description: processedDescription
    }
  ];
}

const ImportDetails = ({ ...props }) => {
  const [show, showModal] = useState(false);
  const [updateSettings] = useMutation(UPDATE_IMPORT_SETTINGS, {
    refetchQueries: [{ query: GET_IMPORT_TYPES }]
  });
  const { imp, importId } = props;

  const steps = getSteps(imp);
  const errors = imp?.errors || [];

  function onSaveSettings(updates) {
    updateSettings({ variables: { input: { importId, updates } } })
      .then(() => showModal(false))
      .catch(error => {
        console.error({ error });
      });
  }
  return (
    <>
      <Segment padded="very" basic>
        <Header as="h4" content={<Trans i18nKey="edi.aside.title" />} />
        <ol className="steps">
          {steps.map((step, i) => (
            <React.Fragment key={`step-${i}`}>
              <Divider section hidden />
              <li className={step.cls}>
                <div style={{ paddingLeft: "50px" }}>
                  <label className={step.progress}>
                    <div className="percentage" />
                    {step.title}
                  </label>

                  <span className="sub">{step.description}</span>
                </div>
              </li>
            </React.Fragment>
          ))}
        </ol>
        {errors.length > 0 && (
          <Message
            error
            header={<Trans i18nKey="edi.aside.errors" />}
            list={errors.map((error, j) => (
              <li key={`error-${j}`}>{error.message}</li>
            ))}
          />
        )}

        {/* import type & settings*/}
        {imp && (
          <>
            <Button basic content="Settings" onClick={() => showModal(true)} />
            <ImportSettingsForm
              show={show}
              showModal={showModal}
              imp={imp}
              onSubmit={onSaveSettings}
            />
          </>
        )}

        <Message
          info
          content={
            <>
              <Message.Header content={<Trans i18nKey="edi.aside.info_header" />} />
              <Trans i18nKey="edi.aside.info_body" />
              <a href="https://www.transmate.eu/help/import-shipments">
                <Trans i18nKey="general.link" />
              </a>
            </>
          }
        />
      </Segment>
    </>
  );
};

const ImportDetailsLoader = ({ importId }) => {
  const { data = {}, loading, error } = useQuery(GET_IMPORT_DOC, {
    variables: { importId },
    fetchPolicy: "cache-only"
  });
  debug("aside data %o", { data, loading, error });
  const imp = data.imp || {};
  return loading ? "Loading..." : <ImportDetails imp={imp} importId={importId} />;
};

const ImportAside = () => {
  const { params } = useRoute();
  const importId = params._id;
  if (!importId) return "pending...";

  return <ImportDetailsLoader importId={importId} />;
};

export default ImportAside;
