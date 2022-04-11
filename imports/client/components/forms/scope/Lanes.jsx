import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Button } from "semantic-ui-react";
import { ReactTable } from "/imports/client/components/tables";
import { useLazyQuery, useApolloClient } from "@apollo/client";

import LaneModal from "./modals/Lane.jsx";

import { getLaneStopData } from "./utils/laneStopData";
import { GET_ADDRESS_DATA, GET_ADDRESS_FRAGMENT } from "./utils/queries";

const LaneStop = ({ stop }) => {
  const client = useApolloClient();
  let addresses;
  if (!stop) return "-";

  if (stop.zones != null) {
    return stop.zones
      .filter(z => !!z)
      .map(zone => {
        return zone.CC + zone.from + (zone.to ? ` - ${zone.to}` : "");
      })
      .join(", ");
  }
  addresses = [];
  if (stop.addressIds?.length) {
    // eslint-disable-next-line consistent-return, array-callback-return
    addresses = stop.addressIds.map(addressId => {
      try {
        const address = client.readFragment({
          id: `Address:${addressId}`,
          fragment: GET_ADDRESS_FRAGMENT
        });
        if (address) {
          return `${address.name} ${address.city}`;
        }
      } catch (error) {
        console.error(error);
      }
    });
  }
  const locations = stop.locationIds || [];
  return [...addresses, ...locations].join(", ");
};

const LaneOverview = ({ ...props }) => {
  const { t } = useTranslation();
  const [modalState, setModalState] = useState({ show: false });
  const showModal = show => setModalState({ ...modalState, show });
  const { onSave, canEdit } = props;
  const lanes = props.lanes || [];

  const onSaveModal = (update, cb = () => {}) =>
    onSave(update, () => {
      cb();
      showModal(false);
    });

  // lane address data called with qgl query
  // component retrieves stop data with local data query
  const [fetchLaneStopData] = useLazyQuery(GET_ADDRESS_DATA);
  useEffect(() => {
    const { addressIds } = getLaneStopData({ lanes });
    if (addressIds.length) {
      fetchLaneStopData({ variables: { addressIds } });
    }
  }, []);

  const columns = [
    { Header: t("price.list.lane.name"), accessor: "name" },
    {
      Header: t("price.list.lane.from"),
      accessor: "from",
      Cell: ({ value }) => <LaneStop stop={value} />
    },
    {
      Header: t("price.list.lane.to"),
      accessor: "to",
      Cell: ({ value }) => <LaneStop stop={value} />
    },
    {
      Header: t("price.list.lane.stops"),
      accessor: "stops",
      Cell: ({ value }) => (value || []).length
    }
  ];

  const handleClicked = (itemData, index) => {
    setModalState({
      lane: itemData,
      index,
      show: true
    });
  };

  return (
    <>
      <ReactTable
        tableClass="ui very basic selectable table lanes"
        columns={columns}
        data={lanes}
        onRowClicked={handleClicked}
      />
      {canEdit && (
        <>
          <br />
          <Button
            basic
            icon="add"
            content={t("price.list.lane.add")}
            onClick={() => setModalState({ show: true })}
            data-test="scopeLaneBtn"
          />
        </>
      )}
      <LaneModal
        {...modalState}
        showModal={showModal}
        lanes={lanes}
        onSave={onSaveModal}
        isLocked={!canEdit}
      />
    </>
  );
};

LaneOverview.propTypes = {
  onSave: PropTypes.func,
  canEdit: PropTypes.bool,
  lanes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      incoterm: PropTypes.string,
      from: PropTypes.object,
      to: PropTypes.object,
      stops: PropTypes.arrayOf(PropTypes.object)
    })
  )
};
export default LaneOverview;
