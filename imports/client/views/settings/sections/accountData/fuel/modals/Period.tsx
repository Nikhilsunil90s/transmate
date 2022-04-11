import React, { useEffect, useMemo, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import moment from "moment";
import { Trans } from "react-i18next";
import {
  ModalComponent,
  ModalActions,
  ModalActionsClose
} from "/imports/client/components/modals";
import { ReactTable } from "/imports/client/components/tables";
import { Form, Button, Message, TextArea, Input } from "semantic-ui-react";

import { GET_FUEL_INDEX } from "../utils/queries";
import { FuelIndex, FuelPeriod, FuelPeriodTopic } from "../fuel.d";

const debug = require("debug")("fuel");

// periods to show:
// - either minimal of period document
// - either today - three months
const END_AT_YEAR = moment()
  .add(3, "month")
  .year();

const END_AT_MONTH = moment()
  .add(3, "month")
  .month();

const INITIAL_VISIBLE_PERIODS = 5;

let saveForm = () => {};

function getPeriodData(
  m: number,
  y: number,
  periods: FuelPeriod[]
  // eslint-disable-next-line no-undef
): Partial<FuelPeriod> {
  return periods.find(({ month, year }) => month === m && year === y) || {};
}

/**
 * purpose: show last three dates... when clicking expand, we show x more and so on...
 * latest on top
 * note: month is zero indexed!!!
 */
const buildPeriods = (
  periodData: FuelPeriod[],

  /** year, month, day*/
  start: [number, number, number],
  count: number = 5
): FuelPeriod[] => {
  debug("build");
  const iterator = moment(start);
  let i = 0;
  const results: FuelPeriod[] = [];
  while (!(i >= count)) {
    iterator.subtract(1, "month");
    i += 1;

    const month = iterator.month() + 1;
    const year = iterator.year();
    const { fuel, index } = getPeriodData(month, year, periodData);
    results.push({ month, year, fuel, index });
  }
  return results;
};

const initializePeriods = periodData => {
  debug("initialize");
  const periods = buildPeriods(
    periodData,
    [END_AT_YEAR, END_AT_MONTH, 1],
    INITIAL_VISIBLE_PERIODS
  );

  return periods;
};

const InputCell = ({ value: orgValue, topic, index, onChange }) => {
  const [value, setValue] = useState(orgValue || "");

  const updateValue = (root, { value: newValue }) => {
    setValue(newValue);
    onChange(index, newValue, topic);
  };
  return <Input type="number" value={value} onChange={updateValue} />;
};

const Table = ({ periods, updatePeriod, locked }) => (
  <ReactTable
    data={periods}
    columns={[
      {
        id: "period",
        Header: <Trans i18nKey="settings.fuel.period.period" />,
        Cell: ({ row: { original: o = {} } }) =>
          `${String(o.month).padStart(2, "0")}/${o.year}`
      },
      {
        accessor: "fuel",
        Header: <Trans i18nKey="settings.fuel.period.fuel" />,
        Cell: ({ value, row: { index } }) =>
          locked ? (
            value || "-"
          ) : (
            <InputCell
              value={value}
              topic="fuel"
              onChange={updatePeriod}
              index={index}
            />
          )
      },

      {
        id: "index",
        Header: <Trans i18nKey="settings.fuel.period.index" />,
        Cell: ({ value, row: { index } }) =>
          locked ? (
            value || "-"
          ) : (
            <InputCell
              value={value}
              topic="index"
              onChange={updatePeriod}
              index={index}
            />
          )
      },
      { id: "empty" }
    ]}
  />
);

// initialize:
// toState -> periods: visible periods + values looked up.
// on update -> modify the state to alter the periods
// on view more -> append periods + look up from original index data
// on save: filter out the empty keys + combine with the original index Periods list + sort
export const PeriodForm = ({
  fuelIndex,
  onSave,
  locked
}: {
  fuelIndex: FuelIndex;
  onSave: (FuelIndex) => void;
  locked: boolean;
}) => {
  const { periods: originalPeriodData, ...idx } = fuelIndex;
  const [periods, setPeriodData] = useState<FuelPeriod[]>([]);
  const [indexData, setIndexData] = useState<
    // eslint-disable-next-line no-undef
    Partial<Pick<FuelIndex, "name" | "description">>
  >({});
  useEffect(
    () => setPeriodData(initializePeriods(originalPeriodData || [])),
    []
  );
  useEffect(() => setIndexData(idx || {}), []);

  function showMorePeriods() {
    const { month, year } = periods[periods.length - 1]; // last item
    const newPeriods = buildPeriods(originalPeriodData, [year, month, 1]);
    setPeriodData([...periods, ...newPeriods]);
  }

  function updatePeriod(index: number, value: string, topic: FuelPeriodTopic) {
    const updatedPeriods = [...periods];
    updatedPeriods[index][topic] = parseFloat(value);
    debug("save", updatedPeriods);
    setPeriodData(updatedPeriods);
  }
  saveForm = () => {
    // put periods back together: (updated visible + the old ones)
    const { month: lastMonth, year: lastYear } = periods[periods.length - 1]; // last item
    const updatedPeriods = periods.filter(
      ({ fuel, index }) => fuel !== undefined || index !== undefined
    );
    const lastUpdated = `${lastYear}-${String(lastMonth).padStart(2, "0")}`;
    const otherPeriods = (originalPeriodData || []).filter(
      ({ month, year }) =>
        `${year}-${String(month).padStart(2, "0")}` < lastUpdated
    );

    onSave({
      description: indexData.description,
      periods: [...updatedPeriods, ...otherPeriods]
    });
  };

  const memoizedTable = useMemo(
    () => <Table {...{ periods, updatePeriod, locked }} />,
    [periods.length]
  );

  return (
    <Form>
      <Form.Group widths={2}>
        <Form.Field>
          <label>
            <Trans i18nKey="settings.fuel.period.name" />
          </label>
          {fuelIndex.name || ""}
        </Form.Field>
      </Form.Group>
      {memoizedTable}
      <Button
        content={<Trans i18nKey="settings.fuel.period.modal.more" />}
        onClick={showMorePeriods}
      />

      <Message
        info
        icon="info"
        content={<Trans i18nKey="settings.fuel.index.info" />}
      />
      <Form.Field>
        <label>
          <Trans i18nKey="settings.fuel.index.description" />
        </label>
        <TextArea
          value={indexData.description || ""}
          disabled={locked}
          onChange={(_, { value }) =>
            setIndexData({ ...indexData, description: String(value) })
          }
        />
      </Form.Field>
    </Form>
  );
};

const FuelPeriodModal = ({ ...props }) => {
  const { show, showModal, fuelIndexId, onSave, locked } = props;
  const [getIndex, { data = {}, loading }] = useLazyQuery(GET_FUEL_INDEX);

  useEffect(() => {
    if (fuelIndexId) getIndex({ variables: { fuelIndexId } });
  }, [fuelIndexId]);
  const fuelIndex: FuelIndex = data.fuelIndex || {};
  debug("fuel detail %o", { fuelIndexId, ...data });

  const onSaveForm = updates => onSave({ fuelIndexId, updates });

  return (
    <ModalComponent
      show={show}
      showModal={showModal}
      title={<Trans i18nKey="settings.fuel.period.modal.title" />}
      body={
        loading ? (
          "Loading ..."
        ) : (
          <PeriodForm
            fuelIndex={fuelIndex}
            onSave={onSaveForm}
            locked={locked}
          />
        )
      }
      actions={
        locked ? (
          <ModalActionsClose {...{ showModal }} />
        ) : (
          <ModalActions {...{ showModal, onSave: () => saveForm() }} />
        )
      }
    />
  );
};

export default FuelPeriodModal;
