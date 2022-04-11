import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "semantic-ui-react";
import { ReactTable } from "/imports/client/components/tables";

import EquipmentModal from "./modals/Equipment.jsx";

const EquipmentOverview = ({ ...props }) => {
  const { t } = useTranslation();
  const [modalState, setModalState] = useState({ show: false });
  const showModal = show => setModalState({ ...modalState, show });
  const { canEdit, onSave } = props;
  const equipments = props.equipments || [];

  const columns = [
    { Header: t("price.list.equipment.name"), accessor: "name" },
    {
      Header: t("price.list.equipment.types"),
      accessor: "types",
      Cell: ({ value }) => (value || []).join(", ")
    }
  ];

  const handleClicked = (itemData, index) => {
    setModalState({
      equipment: itemData,
      index,
      show: true
    });
  };

  const onSaveModal = update => {
    onSave(update, () => showModal(false));
  };

  return (
    <>
      <ReactTable
        className={`ui very basic table ${canEdit ? "selectable" : ""}`}
        columns={columns}
        data={equipments}
        onRowClicked={handleClicked}
      />
      {canEdit && (
        <>
          <br />
          <Button
            basic
            icon="add"
            content={t("price.list.equipment.add")}
            onClick={() => setModalState({ show: true })}
            data-test="scopeEquipmentBtn"
          />
        </>
      )}
      <EquipmentModal
        {...modalState}
        showModal={showModal}
        equipments={equipments}
        onSave={onSaveModal}
      />
    </>
  );
};

export default EquipmentOverview;
