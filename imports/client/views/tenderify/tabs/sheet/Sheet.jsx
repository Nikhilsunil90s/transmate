import React, { useEffect } from "react";

import { Trans } from "react-i18next";
import PropTypes from "prop-types";
import { useApolloClient, useQuery } from "@apollo/client";
import { Message, Segment } from "semantic-ui-react";
import { tabProptypes } from "../../utils/propTypes";
import { GET_TENDER_BID_DATA_GRID } from "./utils/queries";
import BiddingSheet from "./BiddingSheetTableComponent";
import { toast } from "react-toastify";
import { parseFilterModel } from "./utils/parseAGgridFilterModel";
import { cloneDeep } from "lodash";
import useTenderBidWokerStatus from "./utils/useTenderBidWokerStatus";

const debug = require("debug")("tenderBid:sheet");

const TenderifyDataTableEmpty = () => (
  <Message
    info
    icon="exclamation"
    header={<Trans i18nKey="tenderify.data.emptyTitle" />}
    content={<p>{<Trans i18nKey="tenderify.data.empty" />}</p>}
  />
);

export const TenderifySheet = props => {
  const { serverSideDatasource } = props;
  return (
    <Segment as="section" style={{ width: "100%", minHeight: "250px" }} className="stretch">
      {serverSideDatasource?.rowCount !== 0 ? (
        <BiddingSheet {...props} />
      ) : (
        <TenderifyDataTableEmpty />
      )}
    </Segment>
  );
};

TenderifySheet.propTypes = {
  ...tabProptypes,
  rowData: PropTypes.array,
  headerDefs: PropTypes.array
};

const PAGE_SIZE = 20;

const TenderifySheetLoader = props => {
  const { tenderBidId } = props;
  const client = useApolloClient();
  //fetch header only
  const { data, loading, error } = useQuery(GET_TENDER_BID_DATA_GRID, {
    variables: {
      input: {
        tenderBidId,
        filters: [],
        range: {
          start: 0,
          limit: 1
        }
      }
    }
  });

  const serverSideDatasource = {
    getRows: async params => {
      const {
        request: { startRow, endRow, sortModel, filterModel },
        success,
        fail
      } = params;
      const failError = message => {
        toast.error(message);
        fail();
      };

      try {
        const { errors, data: fetchdata, meta } = await client.query({
          query: GET_TENDER_BID_DATA_GRID,
          variables: {
            input: {
              tenderBidId,
              // TODO:
              filters: parseFilterModel(filterModel),
              range: {
                start: startRow,
                limit: endRow - startRow
              }
            }
          },
          fetchPolicy: "network-only"
        });
        debug("client.query result %o", { errors, data, meta });
        if (errors && errors.length) return failError(errors?.[0]?.message);
        const successData = {
          rowData: cloneDeep(fetchdata?.gridData?.data),
          rowCount: fetchdata?.gridData?.stats?.totalCount
        };
        success(successData);
      } catch (err) {
        failError(err.message);
      }
    }
  };

  debug("apollo data %o", { data, error });
  // TODO: when not initialized > then show loading, else show the overlay?
  // isue is that the structure might have been changed between refreshes
  if (loading) return <Segment loading />;
  if (error)
    return (
      <Segment>
        <Message
          warning
          icon="exclamation"
          header={<Trans i18nKey="tenderify.data.errorTitle" />}
          content={<p>{<Trans i18nKey="tenderify.data.error" />}</p>}
        />
      </Segment>
    );
  const { headerDefs } = data?.gridData || {};
  return (
    <TenderifySheet
      {...props}
      pagination={true}
      paginationPageSize={PAGE_SIZE}
      cacheBlockSize={PAGE_SIZE}
      serverSideStoreType={"partial"}
      rowModelType={"serverSide"}
      serverSideDatasource={serverSideDatasource}
      headerDefs={headerDefs || []}
    />
  );
};

TenderifySheetLoader.propTypes = {
  ...tabProptypes
};

// let isPolling;
const TenderifySheetWorkerHoldScreen = props => {
  const { tenderBidId } = props;

  const { loading, worker } = useTenderBidWokerStatus(tenderBidId);
  if (loading) return "Loading...";
  if (worker?.isRunning) return `Generating sheet... ${worker?.current} of ${worker.total}`;
  return <TenderifySheetLoader {...props} />;
};

TenderifySheetWorkerHoldScreen.propTypes = {
  ...tabProptypes
};

export default TenderifySheetWorkerHoldScreen;
