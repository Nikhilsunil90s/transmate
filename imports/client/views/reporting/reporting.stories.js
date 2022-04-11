import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import Reporting from "./Reporting.jsx";
import publicReports from "/imports/api/reporting/enums/publicReports.json";

const debug = require("debug")("reporting:story");

export default {
  title: "Reporting/page"
};

const reports = {
  public: Object.entries(publicReports).map(([key, value]) => ({
    key,
    ...value
  })),
  custom: []
};

// as part of a uniforms:
export const defaultReports = () => {
  debug("test with ", reports.public);
  return (
    <MockedProvider mocks={[]} addTypename={false}>
      <main className="Reporting">
        <div>
          <Reporting reports={reports.public} />
        </div>
      </main>
    </MockedProvider>
  );
};
