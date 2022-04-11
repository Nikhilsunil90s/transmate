/* eslint-disable meteor/no-session */
import React, { useEffect, useState } from "react";
import { useApolloClient } from "@apollo/client";
import { useTracker } from "meteor/react-meteor-data";
import { Session } from "meteor/session";
import { Trans, useTranslation } from "react-i18next";
import { Segment, Icon, Button, Header } from "semantic-ui-react";

import Loader from "/imports/client/components/utilities/Loader.jsx";
import LaneModal from "/imports/client/components/forms/scope/modals/Lane.jsx";
import VolumeGroupModal from "/imports/client/components/forms/scope/modals/VolumeGroup.jsx";
import EquipmentModal from "/imports/client/components/forms/scope/modals/Equipment.jsx";
import PriceListChargeModal from "../components/ChargeModal";
import PriceListRateModal from "../components/RateModal";

import { PriceListComp } from "/imports/utils/priceList/grid__class_comp";
import { PriceListGridSheet2 } from "/imports/client/components/datasheet/PriceListGridSheet2";

const debug = require("debug")("price-list");

// 1. based on pricelist doc -> build structure
// 1.1 create class PriceListComp
// 2. return filters
// 3. get data based on filters
// 4. render the data in the grid
const DynamicModal = ({ Component, ...props }) => {
  return Component ? React.createElement(Component, { ...props }) : null;
};

const isEmptyGrid = ({ lanes, equipments, charges, volumes }) => {
  // if there is no structural element set in the priceList Document this should return true
  let totalItems = (lanes || []).length + (equipments || []).length + (charges || []).length;

  if (!totalItems && volumes?.length) {
    volumes.forEach(v => {
      totalItems += Object.keys(v).length;
    });
  }

  return totalItems === 0;
};

const PriceListGrid = ({ activeFilters, ...props }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [modalProps, setModalProps] = useState({ show: false });
  const showModal = show => setModalProps({ ...modalProps, show });

  const isEmpty = isEmptyGrid(props.priceList);

  const components = {
    LaneModal,
    PriceListChargeModal,
    VolumeGroupModal,
    EquipmentModal,
    PriceListRateModal
  };
  const triggerModal = ({ template, ...button }) => {
    setModalProps({
      show: true,
      ...button,
      onSave: updates => {
        button.onSave(updates, () => showModal(false));
      },
      Component: components[template]
    });
  };

  const { grid, security = {}, priceList, onSave } = props;

  const [priceListComp, setPriceListComp] = useState(grid);

  const renderGrid = () => (
    <PriceListGridSheet2
      {...{
        priceListComp,
        style: { height: "100%" },
        onSave,
        onContextMenu(params) {
          if (!params) {
            // stoast.error("No charge found to edit");
            return;
          }
          triggerModal(params);
        },
        t
      }}
    />
  );

  // tracker: needed for the session
  useEffect(() => {
    debug("gridRefresh filter: %o", activeFilters);

    (async function getData() {
      setLoading(true);
      const res = await grid.refresh({ doc: priceList, activeFilters, security });
      const { filters } = res;
      Session.set("price-list::rates::pageFilters", filters);
      setLoading(false);
      setPriceListComp(grid);
    })();
  }, [activeFilters, priceList]);
  const buttons = grid.getButtons();

  return (
    <>
      <div>
        <Loader loading={loading} />
      </div>
      {isEmpty ? (
        <Segment placeholder style={{ height: "calc(100% - 60px)" }}>
          <Header icon>
            <Icon name="th list" />
            <Trans i18nKey="price.list.rate.gridEmpty" />
          </Header>
        </Segment>
      ) : (
        <div style={{ height: "100%" }}>
          <div id="gridHolder" style={{ height: "100%" }}>
            {renderGrid()}
          </div>
        </div>
      )}

      {/* all buttons here */}
      {security.canEdit && (
        <div>
          {buttons.map((button, i) => (
            <Button
              basic
              key={i}
              icon="add"
              content={button.text}
              onClick={() => {
                const { template, data } = button;

                triggerModal({ template, ...data });
              }}
              data-test={`trigger${button.template}Btn`}
            />
          ))}
        </div>
      )}
      <DynamicModal {...modalProps} showModal={showModal} />
    </>
  );
};

const PriceListGridInit = ({ ...props }) => {
  const { priceList, onSave, security = {} } = props;
  const client = useApolloClient();
  const { t } = useTranslation();

  // initialize:
  const grid = new PriceListComp({
    client,
    doc: priceList,
    onSaveAction: onSave, // onSave priceList
    security,
    t
  });
  debug("grid: %O", grid);

  Session.set("price-list::rates::pageFilters", grid.pageFilters);

  const activeFilters = useTracker(() => {
    const temActiveFilters = Session.get("price-list::rates::activeFilters");

    return temActiveFilters;
  }, []);

  return <PriceListGrid activeFilters={activeFilters} {...props} grid={grid} />;
};

const PriceListRatesSegment = ({ ...props }) => {
  return (
    <Segment padded className="rates">
      <PriceListGridInit {...props} />
    </Segment>
  );
};

export default PriceListRatesSegment;
