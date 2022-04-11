import React from "react";
import { useTranslation } from "react-i18next";
import ItemHeader from "../ItemHeader.jsx";

const BasicHeader = ({ title }) => {
  const { t } = useTranslation();
  return (
    <ItemHeader>
      <div>{t(title)}</div>
    </ItemHeader>
  );
};

export default BasicHeader;
