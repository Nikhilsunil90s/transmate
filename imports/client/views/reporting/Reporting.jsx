import React, { useState } from "react";

import PropTypes from "prop-types";

import { Menu, Container } from "semantic-ui-react";
import ReportDownload from "/imports/client/views/reporting/download/Report";
import ReportingItem from "./ReportingItem";
import useRoute from "../../router/useRoute";

const debug = require("debug")("reporting");

const getReport = (reports = [], section) => {
  const report = reports.find(({ key }) => key === section);
  return report || reports[0] || {};
};

/** render all available reports & a download page in menu
 */
const Reporting = ({ reports = [] }) => {
  const reportSections = [...reports, { key: "download", label: "download" }];
  const { params, setRouteParams } = useRoute();
  const section = params.section || 0;
  const initial = getReport(reportSections, section);
  const [activeTabKey, setActiveTabKey] = useState(initial.key);

  const onSelectTab = (e, d) => {
    const { name } = d;
    setRouteParams({ section: name });
    debug("active Tab %s %o", name, getReport(reportSections, name));
    setActiveTabKey(name);
  };
  return (
    <div>
      <Menu
        pointing
        secondary
        className="tabs"
        items={reportSections.map(({ key, label }) => ({
          key,
          name: key,
          content: label,
          active: key === activeTabKey
        }))}
        onItemClick={onSelectTab}
      />
      {activeTabKey === "download" ? (
        <Container fluid>
          <ReportDownload reports={reports} />
        </Container>
      ) : (
        <ReportingItem report={getReport(reports, activeTabKey)} />
      )}
    </div>
  );
};

Reporting.propTypes = {
  reports: PropTypes.array
};

export default Reporting;
