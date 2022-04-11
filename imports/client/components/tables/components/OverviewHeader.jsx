/* eslint-disable meteor/no-session */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb, Dropdown } from "semantic-ui-react";
import { Session } from "meteor/session";

const debug = require("debug")("overviewheader");

const OverviewHeader = ({
  overviewName,
  views = {},
  currentViewLabel,
  setView,
  setDefaultView,
  dataExport,
  locationTag
}) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  debug(
    "get view id from session : ",
    overviewName,
    currentViewLabel,
    Session.get(`${overviewName}::viewkey`)
  );
  const sections = [
    {
      key: "root",
      content: t(`${overviewName}.title`),
      link: true,
      onClick: () => setDefaultView()
    }, // sets to default view
    {
      key: "current",
      content: currentViewLabel,
      link: true,
      active: true,
      onClick: () => setVisible(!visible)
    }
  ];

  function setViewKey(key) {
    debug("set view id in session : ", overviewName, currentViewLabel);
    debug("set new key : ", key);
    Session.set(`${overviewName}::viewkey`, key);
    debug("get new key : ", Session.get(`${overviewName}::viewkey`));

    setView(key);
  }

  return (
    <header className="view ui basic segment">
      <div>
        <Dropdown
          text=""
          className="icon"
          labeled
          floating
          icon="filter"
          onClick={() => setVisible(!visible)}
          onBlur={() => setVisible(false)}
          open={visible}
        >
          <Dropdown.Menu>
            {Object.entries(views).map(([key, option]) => (
              <Dropdown.Item
                key={key}
                value={key}
                text={option.text}
                onClick={() => setViewKey(key)}
              />
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <Breadcrumb icon="right angle" sections={sections} />
      </div>
      {dataExport}
      {locationTag}
    </header>
  );
};

export default OverviewHeader;
