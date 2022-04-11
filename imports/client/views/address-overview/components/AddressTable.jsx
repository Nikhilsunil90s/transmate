/* eslint-disable no-use-before-define */
import React from "react";
import { ReactTableWithRowResizer } from "/imports/client/components/tables";
import { Flag } from "semantic-ui-react";

import AddressFooterButtons from "./AddressFooterButtons";
import useRoute from "/imports/client/router/useRoute";

const AddressTable = ({ data, isDataLoading }) => {
  const { goRoute } = useRoute();
  const columns = [
    {
      Header: "Flag",
      accessor: "countryCode",
      Cell: ({ row: { original } }) => <Flag name={original.countryCode} />
    },
    {
      Header: "Country",
      accessor: "country"
    },
    {
      Header: "Name",
      accessor: "addressName"
    },
    {
      Header: "Postal Code",
      accessor: "zip"
    },
    {
      Header: "City",
      accessor: "city"
    },
    {
      Header: "Address",
      accessor: "addressLine"
    }
  ];

  function handleClicked(selectedAddress) {
    if (!selectedAddress?.id) return;
    goRoute("address", { _id: selectedAddress.id });
  }

  return (
    <div>
      <ReactTableWithRowResizer
        paginate
        shouldShowFooterPagination
        isLoading={isDataLoading}
        paginationContent={<AddressFooterButtons />}
        columns={columns}
        data={data}
        onRowClicked={handleClicked}
      />
    </div>
  );
};

export default AddressTable;
