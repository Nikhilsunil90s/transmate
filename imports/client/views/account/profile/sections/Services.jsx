import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Label, Form, Dropdown, Button } from "semantic-ui-react";
import PropTypes from "prop-types";

import { IconSegment } from "../../../../components/utilities/IconSegment";

let i = 1;
const ServicesOverview = ({ services = [] }) => {
  const { t } = useTranslation();
  const hasServices = services.length > 0;
  return hasServices ? (
    <div>
      {services.map(srv => {
        i += 1;
        return <Label key={i}>{srv}</Label>;
      })}
    </div>
  ) : (
    <div className="empty">{t("account.profile.services.empty")}</div>
  );
};

const ServicesForm = ({ services = [], setData }) => {
  const { t } = useTranslation();
  const baseOptions = ["transport", "warehouse", "crossDocking", "VA"].map(type => ({
    key: type,
    value: type,
    text: t(`account.portal.services.types.${type}`)
  }));
  const [dataInput, setDataInput] = useState(services);
  const [options, setOptions] = useState(baseOptions);

  const onchange = (e, { value = [] }) => {
    setDataInput(value);
    setData(value);
  };
  const handleAddition = (e, { value }) => {
    setDataInput([...dataInput, value]);
    setOptions([...options, { key: value, value, text: value }]);
  };
  return (
    <Form>
      <Dropdown
        placeholder={t("partner.profile.services.text")}
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
    </Form>
  );
};

// form toggled "edit", data is stored on save
const ProfileServicesSegment = ({ canEdit, onSave, services = [] }) => {
  const { t } = useTranslation();
  const [isEditing, setEditing] = useState(false);
  const [data, setData] = useState(services);

  const save = () => {
    onSave({ services: data });
    setEditing(false);
  };

  const segmentData = {
    name: "locations",
    icon: "handshake",
    title: t("account.profile.services.title"),
    body: isEditing ? (
      <>
        <ServicesForm {...{ services, setData }} />
      </>
    ) : (
      <ServicesOverview {...{ services }} />
    ),
    ...(canEdit
      ? {
          footer: [
            <div key="left" />,
            <div key="right">
              {isEditing ? (
                <Button basic onClick={save}>
                  {t("form.save")}
                </Button>
              ) : (
                <Button basic onClick={() => setEditing(true)}>
                  {t("form.edit")}
                </Button>
              )}
            </div>
          ]
        }
      : undefined)
  };
  return <IconSegment {...segmentData} />;
};

ProfileServicesSegment.propTypes = {
  canEdit: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  profile: PropTypes.object
};

export default ProfileServicesSegment;
