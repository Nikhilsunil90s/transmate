import { toast } from "react-toastify";
import React, { useState } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { Button, Form } from "semantic-ui-react";
import { AutoForm } from "uniforms-semantic";
import { IconSegment } from "../../../components/utilities/IconSegment";
import SelectField from "/imports/client/components/forms/uniforms/SelectField";

import { BuildFilter } from "/imports/client/components/forms/query-builder/reports-filter.jsx";

const debug = require("debug")("reporting:download:view");

const GET_DOWNLOAD_URL = gql`
  query getReportDownloadURL($input: ReportDownloadURLInput!) {
    downloadLink: getReportDownloadURL(input: $input)
  }
`;

let formRef;
export const ReportDownload = ({ reports = [] }) => {
  const [getDownloadUrl, { loading }] = useLazyQuery(GET_DOWNLOAD_URL, {
    onCompleted(data = {}) {
      debug("response %o", data);
      if (!data.downloadLink) throw new Error("no link received");
      toast.info("start download...");
      window.location.href = data.downloadLink;
    },
    onError(error) {
      console.error({ error });
      toast.error("Could not download data");
    }
  });
  debug("report download options", reports);
  let stringFilter;
  const setFilter = filter => {
    debug("setFilter", filter);
    stringFilter = filter;
  };

  const reportOptions = reports.map(({ key, label }) => ({
    key,
    text: label,
    value: key
  }));
  const submitForm = () => {
    debug("submitForm %o", formRef);
    formRef.submit();
  };

  const onSubmitForm = async ({ selectedKey }) => {
    debug("submit %o", { selectedKey, stringFilter });
    const report = reports.find(({ key }) => key === selectedKey);
    if (!report) return;
    const { dataSetId } = report;
    toast.info("prepare report...");
    getDownloadUrl({ variables: { input: { dataSetId, filters: { stringFilter } } } });
  };

  return (
    <IconSegment
      name="download"
      icon="download"
      title={<Trans i18nKey={"reporting.download.title'"} />}
      body={<QueryForm {...{ reports, reportOptions, loading, onSubmitForm, setFilter }} />}
      footer={<Button primary content={<Trans i18nKey="form.save" />} onClick={submitForm} />}
    />
  );
};

const QueryForm = ({ reports, reportOptions, loading, onSubmitForm, setFilter }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState(null);

  const handleChange = (key, value) => {
    debug("args", key, value);

    // set filter options for selected key
    if (key === "selectedKey") {
      const filterOptions = (reports.find(el => el.key === value) || {}).filterKeys || null;
      debug("filters %o", filterOptions);
      setFilters(filterOptions);

      // when no filterOptions , erase set filter
      if (!filterOptions) {
        setFilter();
      }
    }
  };
  debug("build form %o", { reportOptions, filters });

  const schema = new SimpleSchema2Bridge(
    new SimpleSchema({
      selectedKey: String

      // filterKeys: { type: String, optional: true }
    })
  );
  debug("schema form", schema);
  return (
    <>
      <AutoForm
        schema={schema}
        onSubmit={onSubmitForm}
        onChange={handleChange}
        ref={ref => {
          formRef = ref;
        }}
      >
        <Form.Group widths={2}>
          <SelectField
            name="selectedKey"
            placeholder={t("form.select")}
            options={reportOptions}
            loading={loading}
            label={t("reporting.download.reportId")}
          />
        </Form.Group>
      </AutoForm>
      {filters ? <BuildFilter fields={filters} output="sql" setFilter={setFilter} /> : ""}
    </>
  );
};

export default ReportDownload;
