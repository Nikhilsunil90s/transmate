import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Button } from "semantic-ui-react";
import { ReactTable } from "/imports/client/components/tables";

import VolumeModal from "./modals/VolumeGroup.jsx";

const VolumeOverview = ({ ...props }) => {
  const { t } = useTranslation();
  const [modalState, setModalState] = useState({ show: false });
  const showModal = show => setModalState({ ...modalState, show });
  const { canEdit, onSave } = props;
  const volumes = props.volumes || [];

  const onSaveModal = update => onSave(update, () => showModal(false));

  const columns = [
    { Header: t("price.list.volume.serviceLevel"), accessor: "serviceLevel" },
    {
      Header: t("price.list.volume.uom"),
      accessor: "uom"
    },
    {
      Header: t("price.list.volume.ranges"),
      accessor: "ranges",
      Cell: ({ value }) =>
        (value || []).map((rng, i) => (
          <React.Fragment key={i}>
            <span style={{ opacity: 0.5, marginRight: ".5em" }}>#{i}</span>
            {rng.from} - {rng.to}
            <br />
          </React.Fragment>
        ))
    }
  ];

  const handleClicked = (itemData, index) => {
    setModalState({
      volume: itemData,
      index,
      isLocked: !canEdit,
      show: true
    });
  };

  return (
    <>
      <ReactTable
        className={`ui very basic table top aligned ${canEdit ? "selectable" : ""}`}
        columns={columns}
        data={volumes}
        onRowClicked={handleClicked}
      />
      {canEdit && (
        <>
          <br />
          <Button
            basic
            icon="add"
            content={t("price.list.volume.add")}
            onClick={() => setModalState({ show: true })}
            data-test="scopeVolumeBtn"
          />
        </>
      )}
      <VolumeModal
        {...modalState}
        showModal={showModal}
        volumes={volumes}
        onSave={onSaveModal}
        isLocked={!canEdit}
      />
    </>
  );
};

VolumeOverview.propTypes = {
  volumes: PropTypes.arrayOf(PropTypes.object),
  onSave: PropTypes.func,
  canEdit: PropTypes.bool
};

export default VolumeOverview;
