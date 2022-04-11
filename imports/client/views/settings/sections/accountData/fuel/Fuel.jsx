import React, { useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { useApolloClient, useQuery } from "@apollo/client";

import { Trans } from "react-i18next";
import { Button, ButtonGroup, Popup } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import FuelIndexModal from "./modals/FuelIndex";
import FuelPeriodModal from "./modals/Period";
import { ConfirmComponent } from "/imports/client/components/modals/confirm";
import { ReactTable } from "/imports/client/components/tables";
import Loader from "/imports/client/components/utilities/Loader";
import { PercentTag } from "/imports/client/components/tags";
import {
  GET_MY_FUEL_INDEXES,
  UPDATE_FUEL_INDEX,
  ADD_FUEL_INDEX,
  REMOVE_FUEL_INDEX
} from "./utils/queries";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

const debug = require("debug")("fuel");

const IndexTag = ({ period, data }) => {
  const idx = data.find(({ month, year }) => month === period.month && year === period.year);
  return idx ? <PercentTag value={idx.index} /> : " - ";
};

export const FuelOverview = ({ ...props }) => {
  const client = useApolloClient();
  const { fuelIndexes, security } = props;
  const [modalState, setModalState] = useState({ show: false });
  const showModal = show => setModalState({ ...modalState, show });

  const [confirmState, setConfirmState] = useState({ show: false });
  const showConfirm = show => setConfirmState({ ...confirmState, show });

  function removeFuelIndex() {
    const { fuelIndexId } = confirmState;
    if (!fuelIndexId) return;
    client
      .mutate({
        mutation: REMOVE_FUEL_INDEX,
        variables: { fuelIndexId },
        refetchQueries: [{ query: GET_MY_FUEL_INDEXES }]
      })
      .then(({ errors }) => {
        if (errors) throw errors;
        toast.success("Fuel index removed");
        showConfirm(false);
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not remove fuel index");
      });
  }

  function onSaveFuel({ fuelIndexId, updates }) {
    debug("updates", updates);
    client
      .mutate({
        mutation: UPDATE_FUEL_INDEX,
        variables: {
          input: {
            fuelIndexId,
            updates
          }
        }
      })
      .then(() => {
        toast.success("Fuel saved");
        setModalState({ show: false });
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not save fuel");
      });
  }

  const periods = [moment().subtract(1, "month"), moment(), moment().add(1, "month")].map(
    period => ({
      month: period.format("MM"),
      year: period.format("YYYY")
    })
  );

  const canEdit = security.canEditFuelModel;
  return (
    <>
      <ReactTable
        tableClass="ui selectable table"
        data={fuelIndexes}
        columns={[
          { Header: <Trans i18nKey="settings.fuel.index.name" />, accessor: "name" },
          { Header: <Trans i18nKey="settings.fuel.index.base" />, accessor: "base.rate" },
          {
            Header: <Trans i18nKey="settings.fuel.index.basePeriod" />,
            accessor: "base",
            Cell: ({ value: v = {} }) => `${v.month}/${v.year}`
          },
          { Header: <Trans i18nKey="settings.fuel.index.fuel" />, accessor: "fuel" },
          { Header: <Trans i18nKey="settings.fuel.index.acceptance" />, accessor: "acceptance" },
          {
            id: "p0",
            Header: `${periods[0].month}/${periods[0].year}`,
            Cell: ({ row: { original: o } }) => (
              <IndexTag period={periods[0]} data={o.periods || []} />
            )
          },
          {
            id: "p1",
            Header: `${periods[1].month}/${periods[1].year}`,
            Cell: ({ row: { original: o } }) => (
              <IndexTag period={periods[1]} data={o.periods || []} />
            )
          },
          {
            id: "p2",
            Header: `${periods[2].month}/${periods[2].year}`,
            Cell: ({ row: { original: o } }) => (
              <IndexTag period={periods[2]} data={o.periods || []} />
            )
          },

          {
            id: "actions",
            accessor: "id",
            className: "collapsing",
            Cell: ({ value: fuelIndexId }) => (
              <ButtonGroup>
                <Button as="a" icon="eye" href={generateRoutePath("fuelDetail", { fuelIndexId })} />
                <Popup
                  content="Edit periods"
                  trigger={
                    <Button
                      icon="calendar alternate outline"
                      onClick={() => setModalState({ show: true, fuelIndexId, locked: !canEdit })}
                    />
                  }
                />
                {canEdit && (
                  <Button
                    icon="trash alternate"
                    onClick={() => setConfirmState({ show: true, fuelIndexId })}
                  />
                )}
              </ButtonGroup>
            )
          }
        ]}
      />
      <FuelPeriodModal {...modalState} showModal={showModal} onSave={onSaveFuel} />
      <ConfirmComponent {...confirmState} showConfirm={showConfirm} onConfirm={removeFuelIndex} />
    </>
  );
};

const SettingsFuel = ({ ...props }) => {
  const client = useApolloClient();
  const [modalState, setModalState] = useState({ show: false });
  const showModal = show => setModalState({ ...modalState, show });
  const { title, icon, loading, fuelIndexes, refetch, security } = props;

  const canEdit = security.canEditFuelModel;

  const onAddFuel = updates => {
    client
      .mutate({
        mutation: ADD_FUEL_INDEX,
        variables: {
          fuel: updates
        }
      })
      .then(({ data, errors }) => {
        if (errors) throw errors;
        debug("create fuel", data);
        toast.success("Fuel added");
        setModalState({ show: false });
        refetch();
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not save fuel");
      });
  };

  return (
    <>
      <IconSegment
        title={title}
        icon={icon}
        body={loading ? <Loader loading /> : <FuelOverview {...props} fuelIndexes={fuelIndexes} />}
        footer={
          canEdit ? (
            <div>
              <Button
                primary
                content={<Trans i18nKey="form.add" />}
                onClick={() => showModal(true)}
              />
            </div>
          ) : (
            undefined
          )
        }
      />
      <FuelIndexModal {...modalState} showModal={showModal} onSave={onAddFuel} />
    </>
  );
};

const SettingsFuelLoader = ({ ...props }) => {
  const { data = {}, loading, error, refetch } = useQuery(GET_MY_FUEL_INDEXES);
  if (error) console.error(error);
  debug("fuel data", { data, loading, error });

  const fuelIndexes = data.fuelIndexes || [];

  return <SettingsFuel {...props} {...{ loading, fuelIndexes, refetch }} />;
};
export default SettingsFuelLoader;
