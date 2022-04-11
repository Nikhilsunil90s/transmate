/* eslint-disable no-use-before-define */
import React from "react";
import { ReactTableWithRowResizer } from "/imports/client/components/tables";
import { AccountRatingTag } from "/imports/client/components/tags";

import { Trans } from "react-i18next";
import capitalize from "lodash.capitalize";

import PartnerOverviewFooter from "./PartnerOverviewFooter";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("partners:overview");

const PartnersTable = ({ data, isDataLoading }) => {
  const { goRoute } = useRoute();
  debug("partners data %o", data);
  const columns = [
    {
      Header: <Trans i18nKey="partner.overview.headers.partnerId" />,
      accessor: "id"
    },

    // {
    //   Header: <Trans i18nKey="partner.overview.headers.name" />,
    //   accessor: "name"
    // },
    {
      Header: <Trans i18nKey="partner.overview.headers.name" />,
      accessor: "name",
      Cell: ({ row: { original } }) => (
        <div className="starRatingOverview">
          <div>{original.name}</div> <AccountRatingTag partnerId={original.id} />
        </div>
      )
    },
    {
      Header: <Trans i18nKey="partner.overview.headers.type" />,
      accessor: "type",
      Cell: ({ row: { original } }) => capitalize(original.type)
    },
    {
      Header: <Trans i18nKey="partner.overview.headers.status" />,
      accessor: "status"
    }
  ];

  function handleClicked(selectedRow) {
    if (!selectedRow?.id) return;
    goRoute("partner", { _id: selectedRow.id });
  }
  const initialState = {
    sortBy: [
      {
        id: "name",
        desc: false
      }
    ]
  };

  return (
    <div>
      <ReactTableWithRowResizer
        paginate
        shouldShowFooterPagination
        isLoading={isDataLoading}
        initialState={initialState}
        paginationContent={<PartnerOverviewFooter />}
        columns={columns}
        data={data}
        onRowClicked={handleClicked}
      />
    </div>
  );
};

export default PartnersTable;
