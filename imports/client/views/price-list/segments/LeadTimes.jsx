import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useApolloClient } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";
import { Segment, Button, Dropdown, Input, Label, Icon } from "semantic-ui-react";
import { ReactTable } from "/imports/client/components/tables";
import LaneModal from "/imports/client/components/forms/scope/modals/Lane.jsx";
import { ConfirmComponent } from "/imports/client/components/modals/confirm";

import { COPY_LEADTIME_LANES } from "../utils/queries";

//#region components
const DayTag = ({ active, canEdit, onClick }) => {
  const [color, setColor] = useState(active);
  const toggle = () => {
    const newVal = !color;
    setColor(newVal);
    onClick(newVal);
  };

  return canEdit ? (
    <Label as="a" color={color ? "blue" : undefined} empty circular onClick={() => toggle()} />
  ) : (
    <Label color={active ? "blue" : undefined} empty circular />
  );
};

const LeadTimeInput = ({ canEdit, hours, onChange }) => {
  const [val, setVal] = useState(hours);
  const [unit, setUnit] = useState(val < 24 ? "hours" : "days");
  const amount = unit === "days" ? Math.round(val / 24, 0) : val;

  const setLT = value => {
    const hrs = unit === "days" ? value * 24 : value;
    setVal(hrs);
    onChange(hrs);
  };

  const options = ["hours", "days"].map(key => ({
    value: key,
    text: <Trans i18nKey={`price.list.leadTime.duration.${key}`} />
  }));

  return canEdit ? (
    <Input
      labelPosition="right"
      value={amount}
      onChange={(_, { value }) => setLT(value)}
      label={
        <Dropdown value={unit} options={options} onChange={(_, { value }) => setUnit(value)} />
      }
    />
  ) : (
    <>
      {amount} {<Trans i18nKey={`price.list.leadTime.duration.${unit}`} />}
    </>
  );
};

const LeadTimeGrid = ({ leadTime, security = {}, updateLeadTime }) => {
  const canEdit = security.canModifyLeadTime;
  const saveDot = ({ active, rowIndex, dayIndex }) => {
    const mod = leadTime;
    mod[rowIndex].days[dayIndex] = active;
    updateLeadTime(mod);
  };
  const saveHrs = ({ hours, rowIndex }) => {
    const mod = leadTime;
    mod[rowIndex].leadTimeHours = hours;
    updateLeadTime(mod);
  };

  const removeItem = index => {
    const mod = leadTime.filter((item, i) => i !== index);
    updateLeadTime(mod);
  };

  const columns = [
    {
      id: "lane",
      Header: <Trans i18nKey="price.list.leadTime.lane" />,
      Cell: ({ row: { original: o } }) =>
        o.lane?.name || <Trans i18nKey="price.list.leadTime.default" />
    },
    {
      id: "leadTime",
      Header: <Trans i18nKey="price.list.leadTime.leadTime" />,
      className: "four wide",
      accessor: "leadTimeHours",
      Cell: ({ value, row: { index } }) => (
        <LeadTimeInput
          hours={value}
          canEdit={canEdit}
          onChange={hours => saveHrs({ hours, rowIndex: index })}
        />
      )
    },
    ...["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day, i) => ({
      id: day,
      accessor: "days",
      Header: <Trans i18nKey={`price.list.leadTime.${day}`} />,
      className: "one wide",
      Cell: ({ value = [], row: { index } }) => (
        <DayTag
          active={value[i]}
          canEdit={canEdit}
          onClick={active => saveDot({ active, rowIndex: index, dayIndex: i })}
        />
      )
    })),
    ...(canEdit
      ? [
          {
            id: "actions",
            Header: () => null,
            Cell: ({ row: { original, index } }) =>
              !original.isDefault && (
                <Icon
                  name="trash"
                  style={{ cursor: "pointer" }}
                  onClick={() => removeItem(index)}
                />
              )
          }
        ]
      : [])
  ];

  return (
    <Segment>
      <ReactTable data={leadTime} columns={columns} tableClass="ui table" />
    </Segment>
  );
};

const LeadTimeLegend = () => (
  <div className="legend">
    <div>
      <div className="ui blue empty circular label" />
      <Trans i18nKey="price.list.form.lead.legend.both" />
    </div>
    <div>
      <div className="ui empty circular label" />
      <Trans i18nKey="price.list.form.lead.legend.none" />
    </div>
  </div>
);

const LeadTimeControls = ({ priceList, leadTime, updateLeadTime, hasUnsaved, saveLeadTimes }) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const [show, showModal] = useState(false);
  const [showCfr, showConfirm] = useState(false);

  // we are re-using the lane modal -> it will return an [] and we just want a {}
  const onSave = ({ lanes: [lane] }) => {
    if (!lane) return;
    const mod = leadTime;
    mod.push({
      ...priceList.defaultLeadTime,
      lane
    });
    updateLeadTime(leadTime);
    saveLeadTimes();
  };

  const copyLanes = () => {
    client
      .mutate({
        mutation: COPY_LEADTIME_LANES,
        variables: { priceListId: priceList.id }
      })
      .then(({ errors }) => {
        if (errors) throw errors;
        showConfirm(false);
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not copy lanes");
      });
  };

  return (
    <Segment floated="right">
      {hasUnsaved && (
        <Button primary content={<Trans i18nKey="form.save" />} onClick={saveLeadTimes} />
      )}
      <Button
        icon="add"
        content={<Trans i18nKey="price.list.leadTime.add" />}
        onClick={() => showModal(true)}
      />
      <Button
        basic
        icon="copy"
        content={<Trans i18nKey="price.list.leadTime.copy.button" />}
        disabled={!priceList.lanes}
        onClick={() => showConfirm(true)}
      />
      <LaneModal {...{ show, showModal, lanes: priceList.lanes, onSave }} />
      <ConfirmComponent
        {...{
          showConfirm,
          show: showCfr,
          content: t("price.list.leadTime.copy.confirm")
        }}
        onConfirm={copyLanes}
      />
    </Segment>
  );
};

//#endregion

const PriceListLeadTimesSection = ({ ...props }) => {
  const { security = {}, priceList = {}, onSave } = props;
  const [leadTime, setLeadTime] = useState([]);
  const [hasUnsaved, setUnsaved] = useState(false);

  useEffect(() => {
    const unifiedLeadTimes = [
      ...(priceList.defaultLeadTime ? [{ ...priceList.defaultLeadTime, isDefault: true }] : []),
      ...(priceList.leadTimes || [])
    ];
    setLeadTime(unifiedLeadTimes);
  }, [priceList]);

  const updateLeadTime = newLeadTime => {
    setLeadTime(newLeadTime);
    setUnsaved(true);
  };

  const saveLeadTimes = () => {
    // split out again the default leadTime and the others
    const [defaultLT, ...leadTimes] = leadTime;
    const { isDefault, ...defaultLeadTime } = defaultLT || {};
    onSave({ leadTimes, defaultLeadTime });
    setUnsaved(false);
  };

  return (
    <Segment padded="very" className="leadTimes">
      {security.canModifyLeadTime && (
        <LeadTimeControls {...props} {...{ hasUnsaved, saveLeadTimes, leadTime, updateLeadTime }} />
      )}
      <LeadTimeLegend />
      <LeadTimeGrid {...props} {...{ leadTime, updateLeadTime }} />
    </Segment>
  );
};

export default PriceListLeadTimesSection;
