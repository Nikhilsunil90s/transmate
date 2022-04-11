import React from "react";
import { useQuery } from "@apollo/client";
import { Button } from "semantic-ui-react";
import { GET_ACCOUNT_SETTINGS } from "../utils/queries";

const debug = require("debug")("shipments:header");

// const debug = require("debug")("shipment:overview-menu");

const HeaderMenu = ({ activeItems, setActiveItems }) => {
  const { data, loading, error } = useQuery(GET_ACCOUNT_SETTINGS);
  debug("data", { data, loading, error });
  if (error) console.error({ error });
  const years = [...(data?.accountSettings?.projectYears || [])].sort((a, b) => b - a);
  const groups = [
    ...new Set([...(data?.accountSettings?.projectCodes || []).map(({ group }) => group)])
  ].sort((a, b) => a - b);

  function setYear(year) {
    let selYear = year;
    if (activeItems.year === year) {
      selYear = null;
    }

    setActiveItems({ ...activeItems, year: selYear });
  }

  function setGroup(group) {
    let selGroup = group;
    if (activeItems.group === group) {
      selGroup = null;
    }

    setActiveItems({ ...activeItems, group: selGroup });
  }

  return (
    <>
      <header className="view ui basic segment">
        <div>
          <Button.Group>
            {years.map(year => (
              <Button
                key={`yr-${year}`}
                basic={year !== activeItems.year}
                content={year}
                onClick={() => setYear(year)}
              />
            ))}
          </Button.Group>
          <Button.Group style={{ marginLeft: "10px" }}>
            {groups.map(group => (
              <Button
                key={`yr-${group}`}
                basic={group !== activeItems.group}
                content={group}
                onClick={() => setGroup(group)}
              />
            ))}
          </Button.Group>
        </div>
      </header>
    </>
  );
};

export default HeaderMenu;
