import React from "react";
import { useTranslation } from "react-i18next";

import { Dropdown } from "semantic-ui-react";

const ShipmentsViewFilterPeriod = ({ filter, field, onChange }) => {
  const { t } = useTranslation();
  const options = ["-d", "d", "+d", "-w", "w", "+w", "-m", "m", "+m"].map((period, i) => ({
    key: i,
    value: period,
    text: t(`shipments.view.filter.type.period.${period}`)
  }));
  const value = filter.period || "-m";
  return (
    <Dropdown
      clearable
      fluid
      selection
      value={value}
      options={options}
      placeholder={t("shipments.view.filter.type.period.default")}
      onChange={(_, { value: newVal }) => onChange(field, { period: newVal })}
    />
  );
};

export default ShipmentsViewFilterPeriod;
