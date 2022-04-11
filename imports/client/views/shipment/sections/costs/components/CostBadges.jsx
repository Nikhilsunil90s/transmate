/* eslint-disable no-use-before-define */
import React from "react";
import { Trans } from "react-i18next";
import get from "lodash.get";
import { leadTimeDays } from "/imports/utils/UI/helpers";

// UI
import { Label, Icon } from "semantic-ui-react";

const debug = require("debug")("shipment:costs");

const CostBadges = ({ cost = {} }) => {
  debug("costs %o", cost);
  return [
    cost.bestCost && (
      <Label
        key="bestPrice"
        size="mini"
        color="blue"
        className="col"
        content={
          <>
            <Icon name="money" /> <Trans i18nKey="shipment.carrier-select.bestPrice" />
          </>
        }
      />
    ),

    cost.bestLeadTime && (
      <Label
        key="bestLeadTime"
        size="mini"
        color="blue"
        className="col"
        content={
          <>
            <Icon name="clock" /> <Trans i18nKey="shipment.carrier-select.bestLeadTime" />
          </>
        }
      />
    ),

    get(cost, ["leadTime", "hours"]) && (
      <Label
        size="mini"
        key="leadTimeDays"
        content={
          <>
            <Icon name="clock" /> {leadTimeDays(cost.leadTime.hours)}
            {<Trans i18nKey="shipment.carrier-select.leadTimeDays" />}
          </>
        }
      />
    )
  ];
};

export default CostBadges;
