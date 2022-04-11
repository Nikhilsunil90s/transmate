import React from "react";
import { Trans } from "react-i18next";
import { storiesOf } from "@storybook/react";

import { Loading } from ".";

storiesOf("Progress", module).add("Loading ", () => (
  <div>
    <Loading isLoading>
      <div
        style={{
          background: "blue",
          width: 300,
          height: 300,
          fontSize: "3rem",
          color: "white",
          lineHeight: "70px"
        }}
      >
        <p>
          Translations Test: <Trans i18nKey="shipment.stage.carrier.label" />
        </p>
      </div>
    </Loading>
  </div>
));
