import { toast } from "react-toastify";
import { useApolloClient } from "@apollo/client";
import React, { useState, useEffect, createRef } from "react";
import PropTypes from "prop-types";

import useWindowDimensions from "../../utils/hooks/useWindowDimensions";
import { GET_EMBED_URL } from "./utils/queries";

const debug = require("debug")("reporting:view");

/** renders the report in an iframe */
const ReportingItem = ({ report }) => {
  debug("reporting item ", { report });
  const client = useApolloClient();
  const [embedURL, setEmbedURL] = useState();
  const [containerSize, setContainerSize] = useState({ height: 0, width: 0 });

  const reportContainerRef = createRef();
  const { height: windowHeight } = useWindowDimensions();

  useEffect(() => {
    const tableContainerSize = reportContainerRef.current.getBoundingClientRect();
    setContainerSize(tableContainerSize);
  }, [windowHeight]);

  useEffect(() => {
    if (!report) return;
    client
      .query({
        query: GET_EMBED_URL,
        variables: {
          input: {
            dataSetId: report.dataSetId,
            reportId: report.reportId,
            filters: report.filters
          }
        },
        fetchPolicy: "no-cache"
      })
      .then(({ data }) => {
        if (!data.url) throw Error("no url");
        debug("embed url generated %s", data.url);
        setEmbedURL(data.url);
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not generate sessionId");
      });
  }, [report]);

  return (
    <div className="reportContainer" ref={reportContainerRef}>
      <iframe
        title="reportingIframe"
        width={containerSize.width}
        height={Math.max(containerSize.height, 360)}
        src={embedURL}
        frameBorder={0}
        style={{ border: 0 }}
        allowFullScreen
      />
    </div>
  );
};

ReportingItem.propTypes = {
  report: PropTypes.shape({
    dataSetId: PropTypes.string.isRequired,
    reportId: PropTypes.string.isRequired,
    filters: PropTypes.object
  })
};

export default ReportingItem;
