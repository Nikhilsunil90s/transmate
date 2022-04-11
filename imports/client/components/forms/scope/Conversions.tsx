import React, { useState } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { ReactTable } from "/imports/client/components/tables";
import { Button, Divider } from "semantic-ui-react";
import UOMConversionModal from "./modals/Conversion";
import { PriceListSelectModal } from "/imports/client/components/modals";

function formatRange({ from, to }) {
  let res = `${from}`;
  if (to) {
    res += ` - ${to}`;
  }
  return res;
}

interface UOMConversionProps {
  canEdit: boolean;
  conversions: Object[];
  copyFromPriceListQuery: any;
  onCopyFromPriceList: (a: { priceListId: string }, cb?: Function) => void;
  onSave: (a: any, cb?: Function) => void;
}

const UOMConversions = ({
  canEdit,
  conversions = [],
  copyFromPriceListQuery,
  onCopyFromPriceList,
  onSave
}: UOMConversionProps) => {
  const { t } = useTranslation();
  const [modalState, setModalState] = useState<{
    show: boolean;
    conversion?: Object;
    conversions?: Object[];
    index?: number;
  }>({
    show: false
  });
  const [selectPLState, setSelectPLState] = useState<boolean>(false);
  const showModal = show => setModalState({ ...modalState, show });

  const handleClicked = (itemData, index) => {
    setModalState({
      conversion: itemData,
      conversions,
      index,
      show: true
    });
  };

  const onSaveModal = (update, cb) => {
    onSave(update, () => {
      setModalState({ show: false });
      // eslint-disable-next-line no-unused-expressions
      cb && cb();
    });
  };

  const handleCopyFromPriceList = model => {
    onCopyFromPriceList(model, () => setSelectPLState(false));
  };

  return (
    <>
      <ReactTable
        tableClass={classNames("ui table", { selectable: canEdit })}
        data={conversions}
        onRowClicked={handleClicked}
        columns={[
          {
            accessor: "from.uom",
            Header: t("conversions.from")
          },
          {
            accessor: "from.range", // {from, to}
            Header: t("conversions.range.title"),
            Cell: ({ value: range }) => formatRange(range || {})
          },
          {
            accessor: "to.uom",
            Header: t("conversions.to")
          },
          {
            accessor: "to.multiplier",
            Header: t("conversions.multiplierAbbr")
          },
          {
            accessor: "to.fixed",
            Header: t("conversions.fixed")
          }
        ]}
      />
      <Divider hidden />
      <div>
        {canEdit && (
          <Button
            basic
            icon="add"
            content={t("price.list.conversions.add")}
            onClick={() => setModalState({ show: true })}
            data-test="addConversionBtn"
          />
        )}
        {canEdit && (
          <Button
            basic
            icon="copy"
            content={t("price.list.conversions.copy")}
            onClick={() => setSelectPLState(true)}
            data-test="copyConversionBtn"
          />
        )}
      </div>

      <UOMConversionModal
        {...modalState}
        isLocked={!canEdit}
        showModal={showModal}
        conversions={conversions}
        onSave={onSaveModal}
      />
      <PriceListSelectModal
        show={selectPLState}
        showModal={setSelectPLState}
        onSave={handleCopyFromPriceList}
        query={copyFromPriceListQuery || { type: "contract" }}
      />
    </>
  );
};

export default UOMConversions;
