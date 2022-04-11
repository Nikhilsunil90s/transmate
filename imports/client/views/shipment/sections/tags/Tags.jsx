import React, { useState } from "react";
import { toast } from "react-toastify";
import { Trans, useTranslation } from "react-i18next";
import { useMutation } from "@apollo/client";

import { Label, Button, Dropdown } from "semantic-ui-react";

import { IconSegment } from "../../../../components/utilities/IconSegment";
import { SHIPMENT_TAGS } from "/imports/api/_jsonSchemas/enums/shipment.js";
import { UPDATE_TAGS } from "./utils/queries";

const debug = require("debug")("shipment:tags");

function baseOptions(tags = []) {
  return [...SHIPMENT_TAGS, ...tags].map(value => ({ key: value, value, text: value }));
}

const TagBody = ({ tags = [], isEditing, onChange }) => {
  const { t } = useTranslation();
  const [dataInput, setDataInput] = useState(tags);
  const [options, setOptions] = useState(baseOptions(tags));

  const onchange = (e, { value = [] }) => {
    setDataInput(value);
    onChange(value);
  };
  const handleAddition = (e, { value }) => {
    // setDataInput([...dataInput, value]);
    setOptions([...options, { key: value, value, text: value }]);
  };
  return (
    <>
      {isEditing && (
        <Dropdown
          placeholder={t("shipment.form.tags.add")}
          fluid
          multiple
          search
          selection
          allowAdditions
          options={options}
          value={dataInput}
          onChange={onchange}
          onAddItem={handleAddition}
        />
      )}
      {!isEditing &&
        (tags.length > 0 ? (
          <div>
            {tags.map((tag, i) => (
              <Label tag key={i} content={tag} />
            ))}
          </div>
        ) : (
          <Trans i18nKey="shipment.form.tags.empty" />
        ))}
    </>
  );
};

const TagSection = ({ shipment = {}, security }) => {
  const canEdit = security.canUpdateTags;
  const [isEditing, toggleEditing] = useState(false);
  const [updatedTags, setUupdatedTags] = useState([]);
  const [updateTags] = useMutation(UPDATE_TAGS);
  const { tags = [] } = shipment;
  const saveTags = async () => {
    const { loading, error } = await updateTags({
      variables: {
        shipmentId: shipment.id,
        tags: updatedTags
      }
    });
    debug("tag update", { loading, error });
    if (error) {
      toast.error("Could not save tag");
      console.error("delete error", error);
      return;
    }

    toggleEditing(false);
  };

  const Footer = () =>
    isEditing ? (
      <div>
        <Button primary content={<Trans i18nKey="form.save" />} onClick={saveTags} />
        <Button
          basic
          primary
          content={<Trans i18nKey="form.cancel" />}
          onClick={() => toggleEditing(false)}
        />
      </div>
    ) : (
      <>
        <div>
          <Button
            primary
            basic
            content={<Trans i18nKey="form.edit" />}
            onClick={() => toggleEditing(true)}
          />
        </div>
      </>
    );

  return (
    <IconSegment
      name="tags"
      icon="tag"
      title={<Trans i18nKey="shipment.form.tags.title" />}
      body={<TagBody {...{ isEditing, tags, onChange: setUupdatedTags }} />}
      footer={canEdit ? <Footer /> : undefined}
    />
  );
};

export default TagSection;
