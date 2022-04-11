import React, { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";

import { Icon, Popup } from "semantic-ui-react";
import CreateShipmentProjectModalButton from "./modals/CreateShipmentProjectModal";
import { ReactTableWithRowResizer } from "/imports/client/components/tables";
import StatusTableCell from "./components/StatusTableCell";
import HeaderMenu from "./components/Header";
import { GET_SHIPMENT_PROJECTS } from "./utils/queries";
import { CountryFlag } from "/imports/client/components/tags";
import useRoute from "../../router/useRoute";

const debug = require("debug")("projects");

const columns = [
  { Header: "Year", accessor: "year" },
  { Header: "Group", accessor: "type.group" },
  { Header: "Code", accessor: "type.code" },
  { Header: "Name", accessor: "title" },
  {
    Header: "Country",
    accessor: "location.countryCode",
    Cell: ({ value }) => <CountryFlag countryCode={value} />
  },
  {
    Header: "Location",
    accessor: "location.name"
  },
  {
    Header: (
      <Popup
        trigger={
          <span>
            <Icon name="arrow alternate circle down outline" />
          </span>
        }
        content="# inbound shipments"
      />
    ),
    accessor: "inCount"
  },
  {
    Header: (
      <Popup
        trigger={
          <span>
            <Icon name="arrow alternate circle up outline" />
          </span>
        }
        content="# outbound shipments"
      />
    ),
    accessor: "outCount"
  },
  {
    Header: "Status",
    accessor: "status",
    Cell: ({ row = {} }) => {
      const shipmentProject = row.original || {};
      return <StatusTableCell status={shipmentProject.status} />;
    }
  }
];

const ShipmentProjectsOverview = () => {
  const { goRoute, queryParams, setQueryParams } = useRoute();
  const { year } = queryParams;
  const { group } = queryParams;
  const initialState = {
    year: year ? Number(year) : undefined,
    group
  };
  const [activeItems, setActiveItems] = useState(initialState);
  function updateSearchParams(newParams) {
    setActiveItems(newParams);

    setQueryParams(newParams);
  }

  const [getProjects, { data, loading, error }] = useLazyQuery(GET_SHIPMENT_PROJECTS);
  useEffect(() => {
    getProjects({ variables: { filters: activeItems } });
  }, [activeItems]);
  debug("shipment projects data", { data, error });
  const { shipmentProjects = [] } = data || {};

  return (
    <div>
      <HeaderMenu activeItems={activeItems} setActiveItems={updateSearchParams} />
      <ReactTableWithRowResizer
        paginate
        shouldShowFooterPagination
        quantifier="projects"
        isLoading={loading}
        columns={columns}
        data={shipmentProjects}
        onRowClicked={row => {
          goRoute("project", { _id: row.id });
        }}
        paginationContent={<CreateShipmentProjectModalButton />}
      />
    </div>
  );
};

export default ShipmentProjectsOverview;
