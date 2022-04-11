import React, { useState } from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { connectField } from "uniforms";
import { useTranslation } from "react-i18next";
import { Icon } from "semantic-ui-react";
import { generateId } from "./_generateFieldId";

export const FileUpload = ({ label, name = "FileUpload", disabled, onChange, accept }) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState();
  const id = generateId({ name });

  function afterFileSelect(event) {
    if (disabled) return;
    const file = event.target.files[0];
    setSelectedFile(file);
    onChange(file); // for handlers..
  }

  return (
    <div>
      <label htmlFor={id} className={classNames("ui icon button", { disabled })}>
        <Icon name="file" />
        {label || t("form.upload")}
      </label>
      <input
        type="file"
        id={id}
        accept={accept}
        style={{ display: "none" }}
        disabled={disabled}
        onChange={afterFileSelect}
      />
      {!!selectedFile && (
        <span className="selectedfileName" style={{ marginLeft: "4px" }}>
          {selectedFile.name}
        </span>
      )}
    </div>
  );
};

FileUpload.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  accept: PropTypes.string
};

export default connectField(FileUpload);
